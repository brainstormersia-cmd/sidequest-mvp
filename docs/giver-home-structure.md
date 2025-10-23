# Struttura attuale Home Giver

## Card missione attiva (`ActiveMissionCard`)
- **Header singola riga** con "🟢 {status}" a sinistra, timer "⏱" e pulsante chat a destra.
- **Headline** principale "{status}" in bianco 96%.
- **Identità Doer**: avatar circolare, nome in grassetto, descrizione breve.
- **Barra di avanzamento**: traccia #222832, fill blu primario, label percentuale allineata a destra.

## Riepilogo missione (`MissionSummaryScreen`)
- **Top bar sticky** traslucida con stato, timer e chiusura.
- **Card vetrosa** con gradiente tenue e contenuto compatto: profilo Doer, titolo • compenso, itinerario, note.
- **Progress bar** prima della roadmap.
- **Roadmap verticale** con nodi pieni/anello/vuoti in funzione dello stato.
- **Action bar sticky** inferiore con CTA pill "Apri chat" e "Annulla".

## Sezioni dashboard
- **HomeGiverSection** mostra `ActiveMissionSection` con card e link "Visualizza tutte".
- Altre sezioni (missioni recenti, nuovo utente) rimangono invariate rispetto all'ultimo aggiornamento.
