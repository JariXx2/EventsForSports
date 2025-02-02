const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = (env) => {
  const isDev = 'dev' in env;

  return {
    // Entry point for our application
    entry: "./main.js",

    // Output configuration
    output: {
      path: path.resolve(__dirname, "./public"),
      filename: "bundle.js",
    },

    // Module configuration
    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|png|gif|svg)$/,
          use: "file-loader",
        },
        {
          test: /\.vue$/,
          loader: "vue-loader",
          options: {
            loaders: {
              pug: "pug-plain-loader",
            },
          },
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(css|scss)$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.pug$/,
          use: ["pug-plain-loader"],
        },
      ],
    },

    // Plugins configuration
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        "process.env.BASE_URL": JSON.stringify("/"),
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
      ...(isDev
        ? []
        : [
            new TerserPlugin({
              terserOptions: {
                ecma: undefined,
                warnings: false,
                parse: {},
                compress: {},
                mangle: true, // Note `mangle.properties` is `false` by default.
                module: false,
                output: null,
                toplevel: false,
              },
            }),
          ]),
    ],

    // Optimization configuration
    optimization: isDev
      ? {
          minimize: false,
        }
      : {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                ecma: undefined,
                warnings: false,
                parse: {},
                compress: {},
                mangle: true, // Note `mangle.properties` is `false` by default.
                module: false,
                output: null,
                toplevel: false,
              },
            }),
          ],
        },

    // Development mode settings
    devtool: isDev ? "inline-source-map" : "source-map",
    mode: isDev ? "development" : "production",
  };
};