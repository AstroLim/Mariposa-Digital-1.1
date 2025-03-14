const path = require('path');

module.exports = {
  mode: 'development',
  // Multiple entry points
  entry: {
    'firebase-register-login': './src/firebase-register-login.js',
    'firebase-load-user': './src/firebase-load-user.js', // Add more entry points as needed
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