# Sidequest MVP

App mobile (Expo + React Native + TypeScript) per pubblicare missioni locali, candidarsi e gestire un flusso giver/doer con fallback offline.

## 1) Stato del progetto
Questo repository è stato aggiornato per essere:
- **AI-ready**: supporta orchestratori e agenti con template, backlog e convenzioni in `ai/`.
- **Più testabile in locale**: comandi rapidi per check tecnici e smoke test.
- **Più accessibile da mantenere**: documentazione consolidata e materiale storico separato.

## 2) Stack tecnico
- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Supabase (opzionale, con fallback locale)

## 3) Avvio rapido
```bash
npm install
npm run start
```

Comandi utili:
```bash
npm run android
npm run ios
npm run web
npm run typecheck
npm run doctor
npm run check
npm run test:local
```

## 4) Test locali (per vedere cambiamenti)
### Check automatici minimi
```bash
npm run test:local
```
Esegue:
1. Typecheck TypeScript.
2. Diagnostica Expo (`expo-doctor`).
3. Smoke check Python toolkit (`py_compile`) se `python3` è disponibile.

### Smoke manuale consigliato
1. Completa onboarding.
2. Apri Home e naviga a Missioni/Eventi/Profilo.
3. Apri dettaglio missione e invia candidatura.
4. Verifica fallback offline senza variabili Supabase.

## 5) Orchestratori e agenti AI
La cartella `ai/` contiene tutto il necessario:
- `ai/orchestrator.config.example.yml`: ruoli standard (planner, implementer, validator, docs_writer).
- `ai/backlog/development-roadmap.md`: roadmap pronta per assegnazione task.
- `ai/contracts/agent-handoff-template.md`: formato handoff obbligatorio.
- `ai/templates/pr-body-template.md`: template PR coerente.

Flusso raccomandato:
1. Orchestratore sceglie task nel backlog.
2. Agente implementa patch.
3. Agente esegue `npm run test:local`.
4. Agente produce handoff standard.
5. Reviewer approva e merge.

## 6) Struttura directory
```text
sidequest-mvp/
├── ai/                         # Hub collaborazione AI (orchestrazione, backlog, handoff)
├── assets/                     # Icone, splash e asset Expo
├── automation/                 # Toolkit Python/Playwright per automazioni esterne
├── docs/
│   ├── archive/                # Note storiche non bloccanti
│   └── README.md               # Indice documentazione
├── scripts/                    # Script operativi (schema DB, seed, checks locali)
├── src/
│   ├── app.tsx                 # Entry app React Native
│   ├── config/                 # Feature flags e stringhe UI
│   ├── components/             # Componenti riusabili di dominio
│   ├── data/                   # Dataset locale fallback
│   ├── features/               # Moduli feature-first (home, missions, onboarding...)
│   ├── routes/                 # Navigazione e provider modal/sheet
│   ├── shared/                 # UI kit + librerie comuni
│   └── types/                  # Tipi globali
├── App.tsx
├── app.config.ts
└── README.md
```

## 7) Cosa integrare ancora
- CI/CD con gate `npm run test:local`.
- Linting e test UI automatici (snapshot/e2e).
- Telemetria minima su funnel core.
- API reali per eventi e progress missione.

## 8) Configurazione ambiente
Per backend reale imposta:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

In assenza di queste variabili, il progetto resta utilizzabile in modalità demo/offline.

## 9) Note manutenzione
- Documentazione attiva: `README.md`, `docs/README.md`, `ai/`.
- Materiale precedente: `docs/archive/`.
- Aggiorna `CHANGELOG.md` per ogni blocco funzionale.
