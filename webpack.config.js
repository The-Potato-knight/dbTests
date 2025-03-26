const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development', // Set the mode to 'development' or 'production'
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new Dotenv()
    ],
    devtool: 'source-map' // Use source-map for better debugging
};