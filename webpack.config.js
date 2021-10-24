const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const BASE_JS = './src/client/js/';

module.exports = {
  entry: {
    main: BASE_JS + 'main.js',
    camera: BASE_JS + 'camera.js',
    videoPlayer: BASE_JS + 'videoPlayer.js',
    commentBox: BASE_JS + 'commentBox.js',
  },
  // 아직 개발 단계일 떄에는 development, 배포 단계일 때에는 product
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/styles.css',
    }),
  ],
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'assets'),
    clean: true,
  },
  module: {
    rules: [
      {
        // 모든 .js파일을 대상으로!
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
};
