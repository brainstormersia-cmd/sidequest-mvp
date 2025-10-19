# Guida al testing con Expo Go

## Prerequisiti
- **Node.js LTS ≥ 18** installato e presente nel `PATH` (`node -v`).
- **Git** installato (`git --version`).
- **Expo Go** su un dispositivo Android.
- Dispositivo di sviluppo e smartphone collegati **alla stessa rete Wi-Fi** (salvo uso tunnel).

## Setup rapido
```bash
git clone <URL-del-repo>
cd sidequest-mvp
npm install
```

### (Opzionale) Configura Supabase
1. Avvia il tuo progetto Supabase ed esegui gli script:
   ```bash
   psql < scripts/supabase_schema.sql
   psql < scripts/supabase_seed.sql
   ```
2. Imposta `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `app.config.ts` (se usi variabili d'ambiente, riavvia Metro dopo le modifiche).

### (Senza backend) Modalità demo offline
- Apri `src/config/features.ts` e imposta:
  ```ts
  export const useOfflineFallback = true;
  ```
- Nessun backend necessario: l'app userà `src/data/missions.local.json`.

## Avvio
```bash
npm start              # Avvia Metro in modalità LAN
# oppure, se la LAN non funziona
USE_TUNNEL=1 npx expo start --tunnel
```

Scannerizza il QR code con Expo Go.

## Smoke test (criteri di successo)
1. **Onboarding** → premi **"Inizia"**: viene generato e salvato un `device_id`, l'onboarding viene segnato come completato e si accede alla Home.
2. **Home → "Partecipa a missione"**: visualizza la lista con chip di filtro; tocca una missione per aprire il **MissionDetailSheet** e premi **"Candidati"** per aprire l'**ApplicationSheet**.
   - **Online**: l'invio crea un record su `applications`.
   - **Offline**: appare il messaggio "Demo: candidatura simulata (offline)".
3. **Home → "Crea missione"**: completa il wizard a 4 step e pubblica.
   - **Online**: viene creato un record in `missions` con `owner_device_id` uguale al tuo `device_id`.
   - **Offline**: appare l'alert "Demo: missione creata offline (non persistita)".
4. **Profilo**: verifica le sezioni **Le mie missioni** e **Le mie candidature**.
5. **Concedi posizione**: premi il pulsante in Home e assicurati che il permesso sia richiesto e venga loggato/snackbarizzato l'esito.

## Troubleshooting
- **Schermo bianco o crash gesti**: assicurati che la prima riga di `App.tsx` sia `import 'react-native-gesture-handler';` e riavvia Metro.
- **Variabili ENV non lette**: modifica `app.config.ts` e riavvia Metro (`npm start -- --clear`).
- **Problemi di rete LAN**: usa il tunnel `USE_TUNNEL=1 npx expo start --tunnel`.
- **Cache corrotta**: riavvia con `npm start -- --clear` oppure elimina la cache di Expo Go.

## Riferimenti
- Script di preparazione: `scripts/prepare-expo-go.sh`.
- Documentazione di Expo Go: [https://docs.expo.dev/get-started/expo-go/](https://docs.expo.dev/get-started/expo-go/).
