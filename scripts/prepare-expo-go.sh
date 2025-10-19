#!/usr/bin/env sh
set -u

info() {
  printf '%s\n' "$*"
}

warn() {
  printf '⚠️  %s\n' "$*" >&2
}

error() {
  printf '❌ %s\n' "$*" >&2
}

info "▶️  Verifica prerequisiti..."

if ! command -v node >/dev/null 2>&1; then
  error "Node.js >= 18 non rilevato. Installa Node LTS e riprova."
  exit 1
fi
info "Node.js rilevato: $(node -v)"

if ! command -v git >/dev/null 2>&1; then
  error "Git non rilevato. Installa Git per continuare."
  exit 1
fi
info "Git rilevato: $(git --version)"

info "▶️  Installazione dipendenze npm..."
if ! npm install; then
  error "'npm install' non riuscito. Controlla la connessione o ripulisci 'node_modules' e 'package-lock.json', poi riprova."
  exit 1
fi

info "▶️  Controllo ambiente Expo..."
if ! npx expo-doctor; then
  warn "Expo doctor ha segnalato dei problemi. Consulta l'output sopra per i dettagli."
fi

if ! head -n 1 App.tsx | grep -q "import 'react-native-gesture-handler';"; then
  warn "Aggiungi 'import \'react-native-gesture-handler\';' come prima riga in App.tsx per evitare crash di gesture-handler."
fi

if ! grep -q "EXPO_PUBLIC_SUPABASE_URL" app.config.ts || ! grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" app.config.ts; then
  warn "app.config.ts non espone ancora le variabili Supabase in 'extra'. L'app userà il fallback offline: aggiorna app.config.ts e ricorda 'src/config/features.ts'."
fi

if [ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  warn "Variabili di ambiente Supabase non trovate. Verranno usati i dati locali; puoi forzare il fallback impostando 'useOfflineFallback' in src/config/features.ts."
fi

if grep -q "export const useOfflineFallback" src/config/features.ts; then
  info "Flag 'useOfflineFallback' disponibile in src/config/features.ts."
fi

if [ "${USE_TUNNEL:-0}" = "1" ]; then
  info "▶️  Avvio Metro in modalità tunnel..."
  START_CMD="npx expo start --tunnel"
else
  info "▶️  Avvio Metro in modalità LAN..."
  START_CMD="npm start"
fi

info "Metro Bundler disponibile (una volta avviato) su: http://localhost:19000"
info "Apri Expo Go, scansiona il QR code e segui le indicazioni in TESTING-EXPO.md."

if [ ! -f TESTING-EXPO.md ]; then
  warn "File TESTING-EXPO.md non trovato; verifica di aver aggiornato la documentazione."
fi

# Esegue il comando finale sostituendo il processo corrente.
set -- ${START_CMD}
exec "$@"
