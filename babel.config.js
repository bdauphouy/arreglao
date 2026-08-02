module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // react-native-worklets/plugin has to be listed last.
    plugins: [['inline-import', { extensions: ['.sql'] }], 'react-native-worklets/plugin'],
  };
};
