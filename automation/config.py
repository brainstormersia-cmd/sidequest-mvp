from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(slots=True)
class AutomationConfig:
    """Runtime configuration collected from the GUI or CLI."""

    url: str
    start_chapter: int
    headless: bool
    after_play: float
    buffer: float
    slow_mo: float
    use_profile: bool
    user_data_dir: Optional[Path]
    diagnostic_mode: bool
    max_wait: float = 3600.0

    def as_log_summary(self) -> str:
        profile = str(self.user_data_dir) if self.user_data_dir else "<none>"
        return (
            "URL={url}\n"
            "Start chapter={chapter}\n"
            "Headless={headless}\n"
            "Slow-mo={slow} ms\n"
            "After-play extra={after} s\n"
            "Buffer={buffer} s\n"
            "Max wait={max_wait} s\n"
            "Chrome profile enabled={use_profile}\n"
            "User data dir={profile}\n"
            "Diagnostic mode={diagnostic}"
        ).format(
            url=self.url,
            chapter=self.start_chapter,
            headless=self.headless,
            slow=self.slow_mo,
            after=self.after_play,
            buffer=self.buffer,
            max_wait=self.max_wait,
            use_profile=self.use_profile,
            profile=profile,
            diagnostic=self.diagnostic_mode,
        )

    def ensure_valid(self) -> None:
        if not self.url:
            raise ValueError("URL obbligatorio")
        if self.start_chapter < 1:
            raise ValueError("Il capitolo di partenza deve essere >= 1")
        if self.after_play < 0:
            raise ValueError("After-play non può essere negativo")
        if self.buffer < 0:
            raise ValueError("Il buffer non può essere negativo")
        if self.slow_mo < 0:
            raise ValueError("Lo slow-mo non può essere negativo")
        if self.max_wait <= 0:
            raise ValueError("Il tempo massimo deve essere > 0")
        if self.use_profile:
            if not self.user_data_dir:
                raise ValueError("Seleziona una cartella profilo Chrome valida")
            if not self.user_data_dir.exists():
                raise ValueError("La cartella profilo indicata non esiste")
