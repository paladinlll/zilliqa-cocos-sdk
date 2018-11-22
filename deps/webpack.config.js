var path = require('path');
const webpack = require('webpack');
const UglifyJs = require('uglifyjs-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
module.exports = {
  entry: {
    zilliqa: [
      'whatwg-fetch',	  
      './index.js'
    ],
  },    
  externals: {
    dcodeIO: 'dcodeIO',
    protobufjs: 'dcodeIO.ProtoBuf',
    bytebuffer: 'dcodeIO.ByteBuffer'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimizer: [
      new UglifyJs({
        uglifyOptions: {
          compress: true,
          mangle: true,
          toplevel: false,
          output: {
            beautify: false,
            comments: false,
          },
        },
        include: /zilliqa\.js$/,
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
  plugins: [   
	new ReplaceInFileWebpackPlugin([{		
		files: ['dist/zilliqa.cocos.js'],
		rules: [{
			search: '|| util.inquire("long");',
			replace: '//|| util.inquire("long");'
		}]
	}])
  ],
  output: {
	libraryTarget: 'umd',
	globalObject: 'this',
    library: 'zillisqa.js',
    filename: '[name].cocos.js',
    path: path.join(__dirname, 'dist'),
  }, 
  node: {
    crypto: true,
    util: true,
    stream: true,
  },
};