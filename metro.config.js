const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle's generated migrations import raw .sql files.
config.resolver.sourceExts.push('sql');

// expo-sqlite on web runs on wa-sqlite (WASM) and needs SharedArrayBuffer.
config.resolver.assetExts.push('wasm');
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: './global.css' });
