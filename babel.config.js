// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // (se in futuro aggiungi altri plugin, lasciali PRIMA di questo)
      'react-native-reanimated/plugin', // <= deve restare l'ultimo
    ],
  };
};
