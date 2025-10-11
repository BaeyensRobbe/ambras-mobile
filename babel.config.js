module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // only expo preset
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowUndefined: false,
        },
      ],
    ],
  };
};
