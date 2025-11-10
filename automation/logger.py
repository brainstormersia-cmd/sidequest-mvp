from __future__ import annotations

import datetime as _dt
from dataclasses import dataclass
from typing import Protocol


class LogSink(Protocol):
    def write(self, message: str) -> None: ...


@dataclass(slots=True)
class Logger:
    sink: LogSink

    def log(self, message: str) -> None:
        timestamp = _dt.datetime.now().strftime("%H:%M:%S")
        for line in message.splitlines() or [""]:
            self.sink.write(f"[{timestamp}] {line}")

    def divider(self, title: str) -> None:
        self.log("=" * 20 + f" {title} " + "=" * 20)
