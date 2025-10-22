// App.tsx (root)
// App.tsx o index.tsx — PRIMA di tutto

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();

import 'react-native-gesture-handler';   // DEVE essere la primissima
import 'react-native-reanimated';        // consigliato subito dopo
export { default } from './src/app';     // monta il vero App
