# AI Collaboration Hub

Questa cartella prepara il progetto all'ingresso di **orchestratori** e **agenti AI** per completare lo sviluppo in modo governato.

## Obiettivo
- Ridurre il tempo di onboarding di un agente.
- Definire un contratto condiviso per task, handoff e qualità.
- Rendere ripetibile il ciclo: backlog → implementazione → verifica locale → documentazione.

## Struttura
- `orchestrator.config.example.yml`: configurazione base per orchestrazione multi-agente.
- `backlog/development-roadmap.md`: roadmap tecnica operativa (priorità e deliverable).
- `contracts/agent-handoff-template.md`: template standard per passaggi tra agenti.
- `templates/pr-body-template.md`: formato consigliato per PR consistenti.

## Flusso consigliato
1. L'orchestratore assegna una task dal backlog.
2. L'agente implementa in branch dedicato e aggiorna README/changelog se serve.
3. L'agente esegue `npm run test:local`.
4. L'agente compila l'handoff usando `contracts/agent-handoff-template.md`.
5. Un reviewer (umano o AI) valida output e rischi residui.

## Regole minime
- Ogni modifica deve includere un piano test locale.
- Le feature flag devono essere dichiarate in `src/config/features.ts`.
- Le integrazioni esterne devono essere documentate in `README.md`.
