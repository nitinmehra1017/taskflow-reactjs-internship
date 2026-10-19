const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/[name].[contenthash:8].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.js', '.jsx'] },
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
    module: {
      rules: [
        { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        { test: /\.(svg|png|jpe?g|gif|webp|woff2?)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './src/assets/taskflow-mark.svg',
      }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' })]
        : []),
    ],
    optimization: {
      splitChunks: { chunks: 'all' },
      runtimeChunk: 'single',
    },
    devServer: {
      host: '127.0.0.1',
      port: 3000,
      hot: true,
      historyApiFallback: true,
      static: { directory: path.resolve(__dirname, 'public') },
      client: { overlay: { errors: true, warnings: false } },
    },
  };
};
