const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js'
  },
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
  module: {
    rules: [
      { test: /\.hbs$/, loader: "handlebars-loader" },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // fallback to style-loader in development
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    //   {
    //     test: /\.(png|jpe?g|gif|svg)$/i,
    //     use: [
    //       {
    //         loader: 'file-loader',
    //       },
    //     ],
    //   }
    ]
  },
  devServer: {
    open: true
  },
  plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.hbs'
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
        })
    ]
};