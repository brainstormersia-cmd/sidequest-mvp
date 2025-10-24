# Struttura attuale Home Giver

## Card missione attiva (`ActiveMissionCard`)
- **Shell vetrosa** con gradiente `rgba(14,17,23,0.96) → rgba(23,27,35,0.96)`, backdrop scuro 0.28 e sheen diagonale più intenso su fondale ombreggiato `shadow.soft` + `shadow.medium`.
- **Headline principale** "Sta Arrivando" (title case) bianco 96% con icona chat inline sulla stessa riga, pulita da emoji duplicate.
- **Identità Doer**: avatar circolare, nome in grassetto, descrizione grigio 70%.
- **Barra di avanzamento**: traccia #222832, fill blu primario animato, label percentuale sulla stessa riga allineata a destra.

## Riepilogo missione (`MissionSummaryScreen`)
- **Top bar sticky** traslucida con gradiente `rgba(14,17,23,0.94) → rgba(23,30,41,0.68)` e stato/timer/chiudi.
- **Card vetrosa** con gradiente `rgba(255,255,255,0.24) → rgba(255,255,255,0.06)`, backdrop scuro 0.42 e shadow medium.
- **Progress bar** prima della roadmap.
- **Roadmap verticale** con nodi pieni/anello/vuoti in funzione dello stato.
- **Action bar sticky** inferiore con CTA pill "Apri chat" e "Annulla".

## Sezioni dashboard
- **HomeGiverSection** mostra `ActiveMissionSection` con card e link "Visualizza tutte".
- Altre sezioni (missioni recenti, nuovo utente) rimangono invariate rispetto all'ultimo aggiornamento.
