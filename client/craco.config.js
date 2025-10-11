// client/craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "constants": require.resolve("constants-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "fs": false, // fs is typically not needed in browser
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "net": false, // net is typically not needed in browser
        "os": require.resolve("os-browserify/browser"),
        "path": require.resolve("path-browserify"),
        "process": require.resolve("process/browser"),
        "querystring": require.resolve("querystring-es3"),
        "stream": require.resolve("stream-browserify"),
        "tls": false, // tls is typically not needed in browser
        "url": require.resolve("url/"),
        "util": require.resolve("util/"),
        "vm": require.resolve("vm-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "child_process": false, // child_process is typically not needed in browser
      };

      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      // Important: Ensure rules for 'mjs' are correctly handled if they exist
      // This is often needed for some browserify polyfills
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    },
  },
};
