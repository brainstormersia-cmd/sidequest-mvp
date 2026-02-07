# Home Giver screen revamp

## Cosa è stato implementato
- Tema light aggiornato con palette coerente (bianco/bianco sporco, testo #0B0C0E, primary #2563EB, accent #9333EA) e nuovi token per bordo, spacing 20/16 e feedback semantici.
- Nuovi modelli dati per lo stato Home Giver con hook `useGiverHomeState` e gestione delle quattro condizioni logiche (missioni attive, recenti, returning, nuovo utente).
- Banner missione attiva con gradiente nero→grigio, stati colore dinamici, progress bar tokenizzata e CTA verso chat/timeline.
- Carosello missioni recenti con badge stato, importi e haptics su tap/long press.
- Empty states narrativi per returning e nuovi utenti con suggerimenti dinamici e CTA contestuali.
- Sticky CTA `+ Crea missione` animata e sempre accessibile, con safe area e layout flessibile.

## Logiche e architettura
- La logica di derivazione dello stato Home è centralizzata in `useGiverHomeState` per permettere il plug di dati reali senza rifattorizzare la UI.
- `HomeGiverSection` separa le sezioni UI (banner, carosello, suggerimenti, empty states) in componenti memorizzati per ridurre i re-render.
- Animazioni di ingresso (fade/slide) e feedback tattile sono applicati solo ai componenti interattivi per restare a 60 fps.
- Token tema garantiscono consistenza cross-platform e predisposizione alla dark mode (colori semanticamente nominati).

## Prossimi passi suggeriti
1. Collegare i dati reali per stato missioni, includendo polling o subscription per aggiornare in tempo reale il banner attivo.
2. Implementare azioni contestuali del long press con un bottom sheet riutilizzabile (duplica, archivia, elimina) e relativa telemetria.
3. Aggiungere test UI/snapshot per i quattro stati principali e integrare screenshot diff nella CI come richiesto.
4. Estendere il carosello missioni con paginazione e skeleton per stati di loading/offline.

## Requisiti backend
- Endpoint per recuperare missioni attive con attributi: stato, ETA, progress, doer (nome, avatar), messaggistica disponibile.
- Endpoint per missioni recenti con stato, importo, categoria, e statistiche aggregate (pubblicate, completate, tempo medio).
- API per suggerimenti dinamici e microtips contestuali basati su comportamento (feature flag/experiments).
- Eventi telemetry per tracciare tap su CTA, view all, chat, long press e performance (FMP, frame drops) da inviare a sistema di osservabilità.
