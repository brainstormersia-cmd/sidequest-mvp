# Sidequest MVP

Progetto Expo + TypeScript con struttura feature-first e focus su accessibilità, fallback offline e gestione candidature in-app.

## TREE
```
sidequest-mvp/
├── app.config.ts              # Configurazione Expo + extra ENV (DOVE CAMBIARE PERMESSI/ENV)
├── App.tsx                    # Entrypoint che monta src/app.tsx
├── assets/                    # Segnaposti icone/splash
├── bootstrap.sh               # Script di bootstrap del progetto completo
├── package.json               # Dipendenze e script Expo
├── src/
│   ├── app.tsx                # Monta NavigationContainer + provider sheet
│   ├── config/
│   │   ├── strings.ts         # Tutti i testi UI it-IT (DOVE CAMBIARE TESTI)
│   │   └── features.ts        # Feature flag (es. offline fallback)
│   ├── routes/
│   │   ├── RootNavigator.tsx  # Stack principale Onboarding→Home→Missions/Events/Profile
│   │   └── ModalSheetProvider.tsx # Gestione sheet/overlay riutilizzabili
│   ├── shared/
│   │   ├── lib/
│   │   │   ├── theme.ts       # Token colori/spacing/typography (DOVE CAMBIARE COLORI)
│   │   │   ├── supabase.ts    # Client Supabase + warning fallback
│   │   │   ├── permissions.ts # Helper permessi posizione
│   │   │   ├── a11y.ts        # Props accessibilità centralizzate + reduce motion
│   │   │   └── device.ts      # Gestione device_id + reset demo
│   │   └── ui/                # Componenti UI accessibilizzati (Button, Card, Sheet, ecc.)
│   ├── features/
│   │   ├── onboarding/        # Onboarding 2 slide + CTA Inizia
│   │   ├── home/              # Home con card missioni/eventi e CTA permesso posizione
│   │   ├── profile/           # Profilo con liste missioni/candidature e reset demo
│   │   ├── events/            # Placeholder lista eventi mock
│   │   ├── missions/
│   │   │   ├── MissionListScreen.tsx     # Lista missioni + filtri chip + sheet dettaglio
│   │   │   ├── MissionDetailSheet.tsx    # Sheet dettaglio con CTA candidatura
│   │   │   ├── ApplicationSheet.tsx      # Modulo candidatura in-app
│   │   │   ├── api/                      # fetch/create missioni & candidature (Supabase + offline)
│   │   │   ├── components/               # MissionCard, TagChip
│   │   │   └── model/                    # Tipi Mission/Application
│   │   └── create/                       # Wizard 4 step per creare missione (sheet)
│   ├── data/
│   │   └── missions.local.json # 25 missioni demo per fallback offline
│   └── features/events/EventsScreen.tsx # Lista eventi mock
├── scripts/
│   ├── supabase_schema.sql     # Schema tabelle Supabase
│   └── supabase_seed.sql       # Seed rapido profilo + missione demo
└── tsconfig.json / babel.config.js / .gitignore
```

### DOVE CAMBIARE COSA
| Cosa | File/Cartella |
| --- | --- |
| Testi UI / copy | `src/config/strings.ts` |
| Colori, spaziature, font | `src/shared/lib/theme.ts` |
| Feature flag (offline, ecc.) | `src/config/features.ts` |
| Permessi / integrazioni native | `app.config.ts` |
| API missioni/applicazioni | `src/features/missions/api/*.ts` |
| Wizard creazione missione | `src/features/create-mission/` |
| Layout sheet/overlay | `src/shared/ui/Sheet.tsx` e `src/routes/ModalSheetProvider.tsx` |

## SCRIPT
`bootstrap.sh` automatizza la generazione del progetto Expo completo:

1. Crea un progetto nuovo con `npx create-expo-app@latest sidequest-mvp -t expo-template-blank-typescript` in una cartella temporanea.
2. Sostituisce i file generati con la struttura di questa repo (config, src/, assets, script SQL).
3. Installa le dipendenze richieste (`expo install` + `npm install`).
4. Copia il risultato in `dist/sidequest-mvp` accanto alla repo.

### Utilizzo
```bash
# dalla root della repo
chmod +x bootstrap.sh
./bootstrap.sh

cd dist/sidequest-mvp
npm run start
```
Il progetto è pronto per lanciare `expo start`. Configura le variabili `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (via `app.config.ts` o `.env`) per usare Supabase; in assenza, l'app usa automaticamente il fallback offline (`src/data/missions.local.json`).

## QUICK START
1. Installazione dipendenze: `npm install`
2. Avvio Metro bundler: `npx expo start`
3. Scansiona il QR code con Expo Go (iOS/Android) oppure premi `w` per la web preview.
4. Imposta, se disponibili, le variabili `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` prima dell'avvio per abilitare il backend reale.

### Test Plan (Expo Go)
1. Avvia l'app: completa le due slide di onboarding, premi **Inizia** e verifica la navigazione alla Home.
2. In Home prova le tre card (creazione missione in sheet, lista missioni, eventi placeholder) e il bottone **Concedi posizione** verificando il log del permesso.
3. Nella lista missioni cambia filtro, apri un dettaglio (tap) e una preview (long press), poi invia una candidatura usando il sheet dedicato.
4. Dal profilo controlla le tab **Le mie missioni** / **Le mie candidature**, quindi usa **Reimposta dati demo locali** per azzerare onboarding e device id.
5. Se Supabase è configurato, pubblica una missione dal wizard: altrimenti verifica l'alert di modalità demo offline.
