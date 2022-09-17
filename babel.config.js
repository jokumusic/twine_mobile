module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo',
     //{unstable_transformProfile: 'hermes-stable'},
      ]
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },    
  };
};
