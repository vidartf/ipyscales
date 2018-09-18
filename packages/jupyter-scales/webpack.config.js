
const path = require('path');
const version = require('./package.json').version;

const rules = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
];

const externals = ['@jupyter-widgets/base'];

module.exports = [
  {
    entry: './src/index.ts',
    output: {
      filename: 'index.js',
      path: __dirname + '/../../ipyscales/nbextension/static',
      libraryTarget: 'amd'
    },
    module: {
      rules: rules
    },
    devtool: 'source-map',
    externals,
    resolve: {
      // Add '.ts' as resolvable a extension.
      extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    }
  },
  {// Embeddable jupyter-scales bundle
    //
    // This bundle is generally almost identical to the notebook bundle
    // containing the custom widget views and models.
    //
    // The only difference is in the configuration of the webpack public path
    // for the static assets.
    //
    // It will be automatically distributed by unpkg to work with the static
    // widget embedder.
    //
    // The target bundle is always `dist/index.js`, which is the path required
    // by the custom widget embedder.
    //
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'amd',
        library: "jupyter-scales",
        publicPath: 'https://unpkg.com/jupyter-scales@' + version + '/dist/'
    },
    devtool: 'source-map',
    module: {
        rules: rules
    },
    externals,
    resolve: {
      // Add '.ts' as resolvable extensions.
      extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
  }
];
