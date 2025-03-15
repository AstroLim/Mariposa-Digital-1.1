const path = require('path');

module.exports = {
  mode: 'development',
  // Multiple entry points
  entry: {
    'firebase-register-login': './src/firebase-register-login.js',
    'ma-home-page': './SCRIPTS/ma-home-page.js', 
    'ma-view-shipping': './SCRIPTS/ma-view-shipping.js', 
    'ma-settings': './SCRIPTS/ma-settings.js',
    'ma-manage': './SCRIPTS/ma-manage.js',
  },
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js', // This will generate firebase.bundle.js and anotherModule.bundle.js
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
};