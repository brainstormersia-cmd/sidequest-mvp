#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="sidequest-mvp"
TEMPLATE="expo-template-blank-typescript"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="$(mktemp -d)"
TARGET_ROOT="$SCRIPT_DIR/dist"
TARGET_DIR="$TARGET_ROOT/$PROJECT_NAME"

if [ -d "$TARGET_DIR" ]; then
  echo "⚠️  Cartella target '$TARGET_DIR' già esistente. Rimuovila prima di rilanciare lo script." >&2
  exit 1
fi

echo "📦 Creo progetto Expo ($PROJECT_NAME)..."
pushd "$WORK_DIR" >/dev/null
npx create-expo-app@latest "$PROJECT_NAME" -t "$TEMPLATE"

cd "$PROJECT_NAME"
rm -f App.tsx app.json package.json tsconfig.json babel.config.js README.md package-lock.json
rm -rf src

cp "$SCRIPT_DIR/package.json" ./package.json
cp "$SCRIPT_DIR/tsconfig.json" ./tsconfig.json
cp "$SCRIPT_DIR/babel.config.js" ./babel.config.js
cp "$SCRIPT_DIR/App.tsx" ./App.tsx
cp "$SCRIPT_DIR/app.config.ts" ./app.config.ts
cp "$SCRIPT_DIR/.gitignore" ./.gitignore
cp "$SCRIPT_DIR/README.md" ./README.md

rm -rf assets
cp -R "$SCRIPT_DIR/assets" ./assets
cp -R "$SCRIPT_DIR/src" ./src
cp -R "$SCRIPT_DIR/scripts" ./scripts

npx expo install \
  react-native-gesture-handler \
  react-native-safe-area-context \
  react-native-screens \
  @react-native-async-storage/async-storage \
  expo-location \
  expo-constants

npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @supabase/supabase-js \
  uuid

popd >/dev/null

mkdir -p "$TARGET_ROOT"
mv "$WORK_DIR/$PROJECT_NAME" "$TARGET_DIR"
rm -rf "$WORK_DIR"

cat <<'EOMSG'
✅ Setup completato.

Progetto copiato in dist/sidequest-mvp

Comandi rapidi:
  cd dist/sidequest-mvp
  npm install (se servono aggiornamenti)
  npm run start

Ricorda di impostare EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY in app.config.ts o tramite variabili d'ambiente.
EOMSG
