from __future__ import annotations

import asyncio
import queue
import threading
import tkinter as tk
from pathlib import Path
from tkinter import ttk
from typing import Optional

from .automation_runner import AutomationRunner
from .config import AutomationConfig
from .logger import Logger
from .state import StateManager

DEFAULT_PROFILE = Path(r"C:\\Users\\sonom\\AppData\\Local\\Google\\Chrome\\User Data\\Default")


class TkLogSink:
    def __init__(self, text_widget: tk.Text) -> None:
        self.text_widget = text_widget
        self.queue: queue.SimpleQueue[str] = queue.SimpleQueue()

    def write(self, message: str) -> None:
        self.queue.put(message)

    def drain(self) -> None:
        while not self.queue.empty():
            message = self.queue.get()
            self.text_widget.configure(state=tk.NORMAL)
            self.text_widget.insert(tk.END, message + "\n")
            self.text_widget.see(tk.END)
            self.text_widget.configure(state=tk.DISABLED)


class AutomationApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Course Autoplayer")
        self.root.geometry("840x600")
        self.stop_event: Optional[asyncio.Event] = None
        self.loop: Optional[asyncio.AbstractEventLoop] = None
        self.thread: Optional[threading.Thread] = None
        self._build_ui()

    def _build_ui(self) -> None:
        main = ttk.Frame(self.root, padding=12)
        main.pack(fill=tk.BOTH, expand=True)

        form = ttk.Frame(main)
        form.pack(fill=tk.X, pady=(0, 12))

        self.url_var = tk.StringVar()
        self.start_chapter_var = tk.StringVar(value="1")
        self.headless_var = tk.BooleanVar(value=False)
        self.after_play_var = tk.StringVar(value="0")
        self.buffer_var = tk.StringVar(value="5")
        self.slow_var = tk.StringVar(value="0")
        self.use_profile_var = tk.BooleanVar(value=True)
        self.profile_path_var = tk.StringVar(value=str(DEFAULT_PROFILE))
        self.diagnostic_var = tk.BooleanVar(value=False)

        self._add_field(form, "URL", self.url_var, row=0, width=60)
        self._add_field(form, "Capitolo iniziale", self.start_chapter_var, row=1, width=10)
        self._add_checkbox(form, "Headless", self.headless_var, row=1, column=2)
        self._add_field(form, "After-play (s)", self.after_play_var, row=2, width=10)
        self._add_field(form, "Buffer (s)", self.buffer_var, row=2, column=2, width=10)
        self._add_field(form, "Slow (ms)", self.slow_var, row=2, column=4, width=10)
        self._add_checkbox(form, "Usa profilo Chrome", self.use_profile_var, row=3)
        self._add_field(form, "User data dir", self.profile_path_var, row=3, column=2, width=60)
        self._add_checkbox(form, "Modalità diagnostica", self.diagnostic_var, row=4)

        buttons = ttk.Frame(main)
        buttons.pack(fill=tk.X, pady=(0, 12))
        self.start_button = ttk.Button(buttons, text="Start", command=self.start)
        self.start_button.pack(side=tk.LEFT)
        self.stop_button = ttk.Button(buttons, text="Stop", command=self.stop, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=(8, 0))

        log_frame = ttk.LabelFrame(main, text="Log")
        log_frame.pack(fill=tk.BOTH, expand=True)
        self.log_text = tk.Text(log_frame, wrap=tk.WORD, state=tk.DISABLED)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_sink = TkLogSink(self.log_text)
        self.logger = Logger(self.log_sink)
        self._schedule_log_update()

    def _add_field(
        self,
        parent: ttk.Frame,
        label: str,
        variable: tk.StringVar,
        row: int,
        column: int = 0,
        width: int = 20,
    ) -> None:
        ttk.Label(parent, text=label).grid(row=row, column=column, sticky=tk.W, padx=(0, 8), pady=4)
        entry = ttk.Entry(parent, textvariable=variable, width=width)
        entry.grid(row=row, column=column + 1, sticky=tk.W, pady=4)

    def _add_checkbox(
        self,
        parent: ttk.Frame,
        label: str,
        variable: tk.BooleanVar,
        row: int,
        column: int = 0,
    ) -> None:
        ttk.Checkbutton(parent, text=label, variable=variable).grid(
            row=row, column=column, sticky=tk.W, padx=(0, 8), pady=4
        )

    def start(self) -> None:
        if self.thread and self.thread.is_alive():
            self.logger.log("Esecuzione già in corso")
            return
        try:
            config = self._build_config()
        except ValueError as exc:
            self.logger.log(f"Errore configurazione: {exc}")
            return

        self.logger.log("Avvio automazione...")
        self.start_button.configure(state=tk.DISABLED)
        self.stop_button.configure(state=tk.NORMAL)
        self.stop_event = asyncio.Event()
        self.loop = asyncio.new_event_loop()
        state_manager = StateManager()

        def runner() -> None:
            assert self.loop is not None and self.stop_event is not None
            asyncio.set_event_loop(self.loop)
            automation = AutomationRunner(self.logger, self.stop_event, state_manager)
            try:
                self.loop.run_until_complete(automation.run(config))
            except Exception as exc:  # pragma: no cover - GUI execution
                self.logger.log(f"Errore inatteso: {exc!r}")
            finally:
                self.loop.run_until_complete(self.loop.shutdown_asyncgens())
                self.loop.close()
                self.loop = None
                self.stop_event = None
                self.root.after(0, self._on_runner_finished)

        self.thread = threading.Thread(target=runner, daemon=True)
        self.thread.start()

    def stop(self) -> None:
        if self.loop and self.stop_event:
            self.logger.log("Richiesta di stop inviata")
            self.loop.call_soon_threadsafe(self.stop_event.set)
        else:
            self.logger.log("Nessuna esecuzione attiva")

    def _schedule_log_update(self) -> None:
        self.log_sink.drain()
        self.root.after(150, self._schedule_log_update)

    def _on_runner_finished(self) -> None:
        self.start_button.configure(state=tk.NORMAL)
        self.stop_button.configure(state=tk.DISABLED)

    def _build_config(self) -> AutomationConfig:
        url = self.url_var.get().strip()
        start_chapter = int((self.start_chapter_var.get() or "1").strip() or 1)
        after_play = float((self.after_play_var.get() or "0").strip() or 0)
        buffer = float((self.buffer_var.get() or "0").strip() or 0)
        slow = float((self.slow_var.get() or "0").strip() or 0)
        use_profile = bool(self.use_profile_var.get())
        profile_value = self.profile_path_var.get().strip()
        profile_dir = Path(profile_value) if profile_value else None
        diagnostic = bool(self.diagnostic_var.get())
        config = AutomationConfig(
            url=url,
            start_chapter=start_chapter,
            headless=bool(self.headless_var.get()),
            after_play=after_play,
            buffer=buffer,
            slow_mo=slow,
            use_profile=use_profile,
            user_data_dir=profile_dir,
            diagnostic_mode=diagnostic,
        )
        config.ensure_valid()
        return config

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    app = AutomationApp()
    app.run()


if __name__ == "__main__":
    main()
