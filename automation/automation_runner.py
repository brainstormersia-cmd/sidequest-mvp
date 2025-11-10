from __future__ import annotations

import asyncio
import contextlib
import math
import re
from dataclasses import dataclass
from typing import Iterable, Optional

from playwright.async_api import Browser, BrowserContext, ElementHandle, Error, Page, Playwright

from .config import AutomationConfig
from .logger import Logger
from .state import StateManager

_TIME_REGEX = re.compile(r"(?:(?P<h>\d+):)?(?P<m>\d{1,2}):(?P<s>\d{2})")


@dataclass(slots=True)
class LessonRow:
    element: ElementHandle
    title: str
    duration_label: str
    duration_seconds: float
    percentage: int
    raw_percentage: str
    bbox_y: float
    index: int


class AutomationRunner:
    def __init__(self, logger: Logger, stop_event: asyncio.Event, state_manager: Optional[StateManager] = None) -> None:
        self.logger = logger
        self.stop_event = stop_event
        self.state_manager = state_manager or StateManager()
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    async def run(self, config: AutomationConfig) -> None:
        config.ensure_valid()
        self.logger.divider("CONFIG")
        self.logger.log(config.as_log_summary())

        try:
            await self._start_browser(config)
        except Exception as exc:  # pragma: no cover - defensive
            self.logger.log(f"Errore apertura browser: {exc!r}")
            return

        assert self.page is not None
        self.logger.divider("NAVIGAZIONE")
        await self._navigate(config.url)
        if await self._maybe_stop():
            await self._shutdown()
            return

        if config.diagnostic_mode:
            await self._diagnostic_walk(config)
            await self._shutdown()
            return

        await self._run_playlist(config)
        await self._shutdown()

    async def _start_browser(self, config: AutomationConfig) -> None:
        from playwright.async_api import async_playwright

        self.playwright = await async_playwright().start()
        chromium = self.playwright.chromium

        launch_kwargs = {
            "headless": config.headless,
            "slow_mo": config.slow_mo,
            "channel": "chrome",
        }

        if config.use_profile and config.user_data_dir is not None:
            user_data_dir = str(config.user_data_dir)
            self.logger.log(f"Avvio browser persistente con profilo: {user_data_dir}")
            self.context = await chromium.launch_persistent_context(
                user_data_dir=user_data_dir,
                **launch_kwargs,
            )
        else:
            self.logger.log("Avvio browser temporaneo (senza profilo persistente)")
            self.browser = await chromium.launch(**launch_kwargs)
            self.context = await self.browser.new_context()

        assert self.context is not None
        self.page = await self.context.new_page()
        self.page.set_default_timeout(45_000)

    async def _shutdown(self) -> None:
        self.logger.log("Chiusura browser in corso...")
        if self.page:
            with contextlib.suppress(Error):
                await self.page.close()
        if self.context:
            with contextlib.suppress(Error):
                await self.context.close()
        if self.browser:
            with contextlib.suppress(Error):
                await self.browser.close()
        if self.playwright:
            with contextlib.suppress(Exception):
                await self.playwright.stop()
        self.logger.log("Terminato.")

    async def _navigate(self, url: str) -> None:
        assert self.page is not None
        self.logger.log(f"Navigazione: {url}")
        response = await self.page.goto(url, wait_until="domcontentloaded")
        if response:
            self.logger.log(f"HTTP {response.status} {response.status_text}")
        self.logger.log(f"URL corrente: {self.page.url}")
        await self._dismiss_overlays()

    async def _dismiss_overlays(self) -> None:
        assert self.page is not None
        overlay_labels = [
            "Accetta",
            "Accetto",
            "Accetta tutto",
            "Chiudi",
            "Close",
            "Accept",
        ]
        for label in overlay_labels:
            locator = self.page.get_by_role("button", name=re.compile(label, re.IGNORECASE))
            if await locator.count():
                self.logger.log(f"Overlay rilevato ({label}), tento il click")
                with contextlib.suppress(Error):
                    await locator.first.click(timeout=5_000)

    async def _run_playlist(self, config: AutomationConfig) -> None:
        state = self.state_manager.state
        start_chapter_index = max(config.start_chapter - 1, 0)
        if state.chapter_index > start_chapter_index:
            start_chapter_index = state.chapter_index
        self.logger.log(f"Ripresa da stato salvato: capitolo {state.chapter_index + 1}, lezione {state.lesson_index + 1}")

        chapter_headers = await self._collect_chapter_headers()
        self.logger.log(f"Trovati {len(chapter_headers)} capitoli")
        for chapter_idx in range(start_chapter_index, len(chapter_headers)):
            if await self._maybe_stop():
                break
            await self._play_chapter(config, chapter_headers, chapter_idx)
        self.logger.log("Playlist completata")

    async def _diagnostic_walk(self, config: AutomationConfig) -> None:
        self.logger.divider("DIAGNOSTICA")
        chapter_headers = await self._collect_chapter_headers()
        self.logger.log(f"Capitoli trovati: {len(chapter_headers)}")
        for idx, header in enumerate(chapter_headers):
            bbox = await header.bounding_box() or {"y": math.nan}
            text = await self._safe_inner_text(header)
            self.logger.log(f"Capitolo {idx + 1}: '{text.strip()}' @ y={bbox['y']:.2f}")

        chapter_index = max(config.start_chapter - 1, 0)
        if chapter_index >= len(chapter_headers):
            self.logger.log("Indice capitolo oltre il numero di capitoli disponibili")
            return

        await self._ensure_expanded(chapter_headers, chapter_index)
        await asyncio.sleep(5.5)
        lessons, (y_min, y_max) = await self._collect_lessons_in_chapter(chapter_headers, chapter_index)
        self.logger.log(f"Nel capitolo {chapter_index + 1} trovate {len(lessons)} righe cliccabili")
        valid, skipped = 0, 0
        for idx, lesson in enumerate(lessons[:5]):
            decision, reason = self._lesson_decision(lesson)
            info = (
                f"Lezione {idx + 1}: title='{lesson.title}' | durata='{lesson.duration_label}' ({lesson.duration_seconds}s) "
                f"| percentuale='{lesson.raw_percentage}' | y={lesson.bbox_y:.2f} | decisione={decision} ({reason})"
            )
            self.logger.log(info)
            if decision == "PLAY":
                valid += 1
            else:
                skipped += 1
        self.logger.log(f"Riepilogo capitolo: valide={valid}, escluse={skipped}")

    async def _play_chapter(self, config: AutomationConfig, headers: list[ElementHandle], chapter_idx: int) -> None:
        self.logger.divider(f"CAPITOLO {chapter_idx + 1}")
        header = headers[chapter_idx]
        title = (await self._safe_inner_text(header)).strip()
        self.logger.log(f"Titolo capitolo: {title}")
        bbox = await header.bounding_box()
        if bbox:
            self.logger.log(f"Header bbox: y={bbox['y']:.2f}")
        await self._ensure_expanded(headers, chapter_idx)
        self.logger.log("Attesa render (5.5s)")
        await asyncio.sleep(5.5)

        lessons, (y_min, y_max) = await self._collect_lessons_in_chapter(headers, chapter_idx)
        self.logger.log(f"Range verticale: y_min={y_min:.2f}, y_max={'∞' if math.isinf(y_max) else f'{y_max:.2f}'}")
        attempts = 0
        while not lessons and attempts < 3:
            attempts += 1
            self.logger.log(f"Nessuna lezione trovata, retry {attempts}/3 dopo scroll leggero")
            if bbox:
                await self.page.mouse.wheel(0, 120)
            await asyncio.sleep(1.5)
            lessons, (y_min, y_max) = await self._collect_lessons_in_chapter(headers, chapter_idx)

        if not lessons:
            scroll_top = await self.page.evaluate("document.scrollingElement ? document.scrollingElement.scrollTop : 0")
            self.logger.log(f"Tentativi re-scan eseguiti: {attempts}")
            self.logger.log(
                "0 lezioni trovate dopo i tentativi: passo al capitolo successivo (scroll attuale: "
                f"{scroll_top:.2f})"
            )
            self.state_manager.update(chapter_idx + 1, 0)
            return

        self.logger.log(f"Lezioni valide nel capitolo: {len(lessons)}")
        state = self.state_manager.state
        resume_from = state.lesson_index if state.chapter_index == chapter_idx else 0
        if resume_from:
            self.logger.log(f"Ripresa capitolo: salto le lezioni con indice < {resume_from + 1}")

        for lesson_idx, lesson in enumerate(lessons):
            if lesson_idx < resume_from:
                self.logger.log(f"Ripresa: salto lezione indice {lesson_idx + 1}")
                continue
            decision, reason = self._lesson_decision(lesson)
            if decision != "PLAY":
                self.logger.log(f"Skip lezione '{lesson.title}' - motivo: {reason}")
                self._advance_state(chapter_idx, lesson_idx, len(lessons))
                continue
            if await self._maybe_stop():
                return
            await self._play_lesson(config, chapter_idx, lesson_idx, lesson, len(lessons))

        self.state_manager.update(chapter_idx + 1, 0)

    def _lesson_decision(self, lesson: LessonRow) -> tuple[str, str]:
        lowered = lesson.title.lower()
        if "test di fine lezione" in lowered or "dispensa" in lowered:
            return "SKIP", "titolo escluso"
        if lesson.percentage >= 100:
            return "SKIP", "già completata"
        if math.isnan(lesson.duration_seconds) or lesson.duration_seconds <= 0:
            return "SKIP", "durata non valida"
        return "PLAY", "ok"

    async def _play_lesson(
        self,
        config: AutomationConfig,
        chapter_idx: int,
        lesson_idx: int,
        lesson: LessonRow,
        total_lessons: int,
    ) -> None:
        base_wait = 20.0
        residual = max(lesson.duration_seconds - base_wait, 0)
        total_wait = min(base_wait + residual + config.buffer + config.after_play, config.max_wait)
        self.logger.divider(f"LEZIONE {lesson_idx + 1}")
        self.logger.log(
            f"Titolo: {lesson.title}\nDurata: {lesson.duration_label} ({lesson.duration_seconds}s)\n"
            f"Completamento: {lesson.raw_percentage}"
        )
        await self._click_with_retry(lesson.element)
        self.state_manager.update(chapter_idx, lesson_idx)
        self.logger.log(
            f"Attese: base={base_wait}s + residuo={residual:.2f}s + buffer={config.buffer}s + after-play={config.after_play}s"
        )
        self.logger.log(f"Cap massimo attesa: {config.max_wait}s, totale applicato: {total_wait:.2f}s")
        waited = 0.0
        while waited < total_wait:
            if await self._maybe_stop():
                self.logger.log("Stop richiesto durante attesa lezione")
                return
            await asyncio.sleep(1.0)
            waited += 1.0
        self.logger.log("Attesa completata, passo alla prossima lezione")
        self._advance_state(chapter_idx, lesson_idx, total_lessons)

    async def _click_with_retry(self, element: ElementHandle, retries: int = 3) -> None:
        for attempt in range(1, retries + 1):
            try:
                await element.scroll_into_view_if_needed()
                await element.click(timeout=5_000)
                self.logger.log(f"Click riga lezione riuscito (tentativo {attempt}/{retries})")
                return
            except Error as exc:
                self.logger.log(f"Click fallito tentativo {attempt}/{retries}: {exc}")
                await asyncio.sleep(0.8 * attempt)
        self.logger.log("Click fallito dopo tutti i tentativi")

    async def _maybe_stop(self) -> bool:
        if self.stop_event.is_set():
            self.logger.log("Stop richiesto, interrompo il flusso")
            return True
        return False

    def _advance_state(self, chapter_idx: int, lesson_idx: int, lessons_len: int) -> None:
        if lesson_idx + 1 < lessons_len:
            self.state_manager.update(chapter_idx, lesson_idx + 1)
        else:
            self.state_manager.update(chapter_idx + 1, 0)

    async def _ensure_expanded(self, headers: list[ElementHandle], index: int) -> None:
        assert self.page is not None
        header = headers[index]
        await header.scroll_into_view_if_needed()
        with contextlib.suppress(Error):
            await header.click()
        await asyncio.sleep(0.1)

    async def _collect_chapter_headers(self) -> list[ElementHandle]:
        assert self.page is not None
        selectors = [
            "button[id^='headlessui-disclosure-button-']",
            "button[id^='headlessui-accordion-button-']",
            "button[role='button'][class*='font-semibold']",
            "div[role='button'][class*='font-semibold']",
            "button:has(span:has-text('Capitolo'))",
        ]
        handles: list[ElementHandle] = []
        for selector in selectors:
            locator = self.page.locator(selector)
            count = await locator.count()
            if count:
                handles = await locator.element_handles()
                if handles:
                    break
        if not handles:
            handles = await self.page.locator("button, div[role='button']").element_handles()
        return handles

    async def _collect_lessons_in_chapter(
        self, headers: list[ElementHandle], chapter_idx: int
    ) -> tuple[list[LessonRow], tuple[float, float]]:
        assert self.page is not None
        header = headers[chapter_idx]
        bbox = await header.bounding_box()
        y_min = bbox["y"] if bbox else float("-inf")
        if chapter_idx + 1 < len(headers):
            next_bbox = await headers[chapter_idx + 1].bounding_box()
            y_max = next_bbox["y"] if next_bbox else float("inf")
        else:
            y_max = float("inf")

        lessons_selector = "div.cursor-pointer"
        fallback_selector = "div:has(div.cursor-pointer)"
        locator = self.page.locator(lessons_selector)
        handles = await locator.element_handles()
        if not handles:
            handles = await self.page.locator(fallback_selector).element_handles()
        lessons: list[LessonRow] = []
        for idx, element in enumerate(handles):
            bbox_row = await element.bounding_box()
            if not bbox_row:
                continue
            y = bbox_row["y"]
            if not (y_min <= y < y_max):
                continue
            lesson = await self._extract_lesson(element, idx, y)
            lessons.append(lesson)
        return lessons, (y_min, y_max)

    async def _extract_lesson(self, element: ElementHandle, idx: int, y: float) -> LessonRow:
        title = await self._find_text(element, ["div.mb-2", "div.font-medium", "h3", "span"])
        duration_label = await self._find_text(
            element,
            [
                "div.text-sm.text-platform-gray",
                "div.text-sm",
                "span.text-sm",
                "span:has-text(':')",
            ],
            fallback_regex=_TIME_REGEX,
        )
        percentage_label = await self._find_text(
            element,
            [
                "div.w-1/12.text-xs",
                "div.text-xs",
                "span.text-xs",
                "span:has-text('%')",
            ],
            fallback_regex=re.compile(r"\b(\d{1,3})%"),
        )
        duration_seconds = _parse_duration(duration_label)
        percentage = _parse_percentage(percentage_label)
        return LessonRow(
            element=element,
            title=title.strip(),
            duration_label=duration_label,
            duration_seconds=duration_seconds,
            percentage=percentage,
            raw_percentage=percentage_label,
            bbox_y=y,
            index=idx,
        )

    async def _find_text(
        self,
        element: ElementHandle,
        selectors: Iterable[str],
        fallback_regex: Optional[re.Pattern[str]] = None,
    ) -> str:
        for selector in selectors:
            locator = element.locator(selector)
            if await locator.count():
                text = (await locator.first.inner_text()).strip()
                if text:
                    return text
        if fallback_regex:
            text = await element.inner_text()
            match = fallback_regex.search(text)
            if match:
                return match.group(0)
        return ""

    async def _safe_inner_text(self, handle: ElementHandle) -> str:
        with contextlib.suppress(Error):
            return await handle.inner_text()
        return ""


def _parse_duration(label: str) -> float:
    match = _TIME_REGEX.search(label)
    if not match:
        return float("nan")
    hours = int(match.group("h") or 0)
    minutes = int(match.group("m") or 0)
    seconds = int(match.group("s") or 0)
    return float(hours * 3600 + minutes * 60 + seconds)


def _parse_percentage(label: str) -> int:
    match = re.search(r"(\d{1,3})", label)
    if not match:
        return 0
    value = int(match.group(1))
    return max(0, min(value, 100))
