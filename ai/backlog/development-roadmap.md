# Development Roadmap (AI-ready)

## P0 - Stabilità base
- [ ] Attivare lint + typecheck in CI.
- [ ] Inserire test smoke per navigazione principale (Onboarding → Home → Missions).
- [ ] Uniformare gestione errori API (Supabase/offline fallback).

## P1 - Chiusura MVP funzionale
- [ ] Persistenza reale per creazione missione.
- [ ] Dashboard profilo collegata a dati remoti.
- [ ] Eventi reali (non placeholder) con filtro e dettaglio.

## P2 - Hardening prodotto
- [ ] Feature flag server-driven.
- [ ] Telemetria minima: funnel onboarding, creazione missione, candidatura.
- [ ] Migliorare accessibilità (screen reader + contrast checks).

## P3 - Automazione AI operativa
- [ ] Pipeline orchestrata planner/implementer/validator.
- [ ] Generazione automatica release notes da changelog.
- [ ] Quality gate unico (`npm run test:local`) obbligatorio per merge.
