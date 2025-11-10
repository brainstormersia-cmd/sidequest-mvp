from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

from .automation_runner import AutomationRunner
from .config import AutomationConfig
from .logger import Logger
from .state import StateManager


class StdoutSink:
    def write(self, message: str) -> None:
        print(message)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Automazione corsi con Playwright")
    parser.add_argument("url", help="URL del corso da aprire")
    parser.add_argument("--start-chapter", type=int, default=1, help="Capitolo di partenza (1-based)")
    parser.add_argument("--headless", action="store_true", help="Esegue Playwright in headless")
    parser.add_argument("--after-play", type=float, default=0.0, help="Attesa extra dopo la riproduzione")
    parser.add_argument("--buffer", type=float, default=5.0, help="Buffer aggiuntivo per sicurezza")
    parser.add_argument("--slow", type=float, default=0.0, help="Delay slow-mo in millisecondi")
    parser.add_argument(
        "--user-data-dir",
        type=Path,
        default=None,
        help="Cartella profilo Chrome (obbligatoria se --use-profile)",
    )
    parser.add_argument(
        "--use-profile",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Usa il profilo Chrome specificato",
    )
    parser.add_argument("--diagnostic", action="store_true", help="Modalità diagnostica senza riproduzione")
    parser.add_argument(
        "--max-wait",
        type=float,
        default=3600.0,
        help="Tempo massimo di attesa per singola lezione",
    )
    return parser


def run_cli(args: argparse.Namespace) -> None:
    config = AutomationConfig(
        url=args.url,
        start_chapter=args.start_chapter,
        headless=args.headless,
        after_play=args.after_play,
        buffer=args.buffer,
        slow_mo=args.slow,
        use_profile=args.use_profile,
        user_data_dir=args.user_data_dir,
        diagnostic_mode=args.diagnostic,
        max_wait=args.max_wait,
    )
    try:
        config.ensure_valid()
    except ValueError as exc:
        raise SystemExit(f"Configurazione non valida: {exc}") from exc

    logger = Logger(StdoutSink())
    stop_event = asyncio.Event()
    runner = AutomationRunner(logger, stop_event, StateManager())
    asyncio.run(runner.run(config))


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    run_cli(args)


if __name__ == "__main__":
    main()
