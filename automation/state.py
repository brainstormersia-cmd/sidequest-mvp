from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


STATE_FILE = Path(__file__).with_name("state.json")


@dataclass(slots=True)
class AutomationState:
    chapter_index: int = 0
    lesson_index: int = 0

    def as_dict(self) -> dict[str, int]:
        return {"chapter_index": self.chapter_index, "lesson_index": self.lesson_index}

    @classmethod
    def from_dict(cls, data: dict[str, int]) -> "AutomationState":
        return cls(
            chapter_index=int(data.get("chapter_index", 0)),
            lesson_index=int(data.get("lesson_index", 0)),
        )


class StateManager:
    def __init__(self, path: Optional[Path] = None) -> None:
        self._path = path or STATE_FILE
        self._state = self._load()

    @property
    def state(self) -> AutomationState:
        return self._state

    def reset(self) -> None:
        self._state = AutomationState()
        self._save()

    def update(self, chapter_index: int, lesson_index: int) -> None:
        self._state.chapter_index = chapter_index
        self._state.lesson_index = lesson_index
        self._save()

    def _save(self) -> None:
        try:
            self._path.write_text(json.dumps(self._state.as_dict(), indent=2), encoding="utf-8")
        except OSError:
            pass

    def _load(self) -> AutomationState:
        if not self._path.exists():
            return AutomationState()
        try:
            data = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return AutomationState()
        return AutomationState.from_dict(data)
