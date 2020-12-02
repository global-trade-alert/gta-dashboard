const path = require('path');
const webpack = require("webpack");
//require("@babel/register");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  data: path.join(__dirname, 'data')
};


module.exports = {
  mode: 'development',
  entry: {
    '@babel/polyfill': ['@babel/polyfill'],
    main: './src/index.js'
  },
    entry: './src/index.js', 
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Area chart',
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([
     {
       from: paths.data,
       to: paths.dist + '/data'
     }
   ]),
   new webpack.ProvidePlugin({
      d3: 'd3'
  })
 ],
  devtool: 'inline-source-map',
   devServer: {
     contentBase: paths.dist
   },
   output: {
    filename: '[name].js'
  },
  module : {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: ['babel-loader']
        },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(txt|csv|mmdb)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        ]
      }
    ]
  }
}