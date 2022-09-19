module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo',{'unstable_transformProfile':'hermes-canary'}]],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },    
  };
};
