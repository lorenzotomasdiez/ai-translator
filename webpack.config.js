const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'service-worker': './src/service-worker.ts',
    'content': './src/content.ts',
    'popup': './src/popup.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/*.html", to: "[name][ext]" },
        { from: "manifest.json", to: "manifest.json" },
        // Si tienes archivos CSS, imágenes u otros recursos estáticos, agrégalos aquí
        // { from: "src/*.css", to: "[name][ext]" },
      ],
    }),
  ],
}; 