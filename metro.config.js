const path = require('path');
const {getDefaultConfig} = require('metro-config');

module.exports = async () => {
  const {
    resolver: {sourceExts},
  } = await getDefaultConfig();


  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts: [...sourceExts, 'cjs', 'svg'],
      extraNodeModules: {
        crypto: path.resolve(__dirname, './node_modules/expo-crypto'),
        stream: path.resolve(__dirname, './node_modules/stream-browserify'),
        buffer: path.resolve(__dirname, './node_modules/@craftzdog/react-native-buffer'),
        //os: path.resolve(__dirname, './node_modules/react-native-os'),
        path: path.resolve(__dirname, './node_modules/path-browserify'),
        fs: path.resolve(__dirname, './node_modules/react-native-level-fs'),
        //net: path.resolve(__dirname, './node_modules/react-native-tcp'),
        //querystring: path.resolve(__dirname, './node_modules/querystring-es3'),
        //dgram: path.resolve(__dirname, './node_modules/react-native-udp'),
        //stream: path.resolve(__dirname, './node_modules/readable-stream'),        
        //vm: path.resolve(__dirname, './node_modules/vm-browserify'),
      }
    },
  };
};