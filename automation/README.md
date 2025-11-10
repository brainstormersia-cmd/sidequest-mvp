# Automation toolkit

Strumenti per automatizzare la riproduzione dei corsi tramite Playwright con profilo Chrome persistente.

## Requisiti

```bash
pip install -r automation/requirements.txt
playwright install chrome
```

## GUI

```bash
python -m automation
```

La finestra consente di configurare:

- **URL** del corso (obbligatorio)
- **Capitolo iniziale** (indice 1-based)
- **Headless**, **After-play**, **Buffer**, **Slow** (ms)
- **Usa profilo Chrome** + percorso del `user-data-dir`
- **Modalità diagnostica** (senza riproduzione)

I log dettagliati vengono mostrati in tempo reale. Il pulsante **Stop** invia un segnale di interruzione sicuro.

## CLI

```bash
python -m automation.cli <URL> --start-chapter 3 --buffer 10 --diagnostic
```

Tutti i parametri della GUI sono disponibili anche da CLI. Lo stato dell’avanzamento (capitolo/lezione) viene salvato in `automation/state.json` per consentire la ripresa della sessione.
