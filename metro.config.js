if (!Array.prototype.toReversed) {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value() {
      return [...this].reverse();
    },
    writable: true,
    configurable: true,
  });
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== 'wasm'
);

module.exports = config;
