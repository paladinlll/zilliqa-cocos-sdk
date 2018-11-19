var path = require('path');
const webpack = require('webpack');
const UglifyJs = require('uglifyjs-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
module.exports = {
  entry: {
    zilliqa: [
      'whatwg-fetch',
	  //'buffer',
      './index.js'
    ],
  },    
  externals: {
    dcodeIO: 'dcodeIO',
    protobufjs: 'dcodeIO.ProtoBuf',
    bytebuffer: 'dcodeIO.ByteBuffer',
	//buffer : 'commonjs buffer',
	//'bn.js': 'commonjs bn.js'
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
			search: '|| util$$1.inquire("long");',
			replace: '//|| util$$1.inquire("long");'
		}, {
			search: 'tx.amount.toBuffer(',
			replace: 'tx.amount.toArrayLike(Buffer,'
		}, {
			search: 'tx.gasPrice.toBuffer(',
			replace: 'tx.gasPrice.toArrayLike(Buffer,'
		}, {
			search: 'tx.gasLimit.toBuffer(',
			replace: 'tx.gasLimit.toArrayLike(Buffer,'
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