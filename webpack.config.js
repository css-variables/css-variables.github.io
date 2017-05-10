const path = require('path');
const pathJoin = path.join.bind(path);
const webpack = require('webpack');
const packageJson = require('./package.json');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// console.log(packageJson.browserslist);

let rimraf = require(`rimraf`);
[`/js`].forEach((subPath) => {
	rimraf.sync(path.resolve('./assets' + subPath))
})

let getConf = options=>{

	let plugins = [].concat([
		new ExtractTextPlugin("../css/style.css"),
		new (require('webpack-manifest-plugin'))({
			fileName: '../../src/html/inc/assets'+(options.es6?'.es6':'')+'.json'
		}),
		// new (require('assets-webpack-plugin'))({filenamein({filename: './src/html/inc/assets'+(options.es6?'.es6':'')+'.json'}),
		new webpack.NoEmitOnErrorsPlugin(),
		new (require('webpack-chunk-hash'))(),
		new webpack.BannerPlugin({
			banner: '/* Belvg | David Narbutovich */',
			raw: true,
			entryOnly: true
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'runtime',
			minChunks: Infinity,
		})
	]);



	if(!options.dev && !options.es6) {
		plugins.push(new webpack.optimize.UglifyJsPlugin(packageJson['uglify-js']))
	}
	/*if(!options.dev && options.es6) {
		plugins.push(new (require('uglifyjs-webpack-plugin'))(packageJson['uglify-js']))
	}*/
	if(!options.dev && options.es6) {
		plugins.push(new (require("babili-webpack-plugin"))());
	}

	return {
		context: path.join(__dirname, '/src/'),
		module: {
			rules: [
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use:ExtractTextPlugin.extract({
						fallback: 'style-loader',
						publicPath: ``,
						use: [
							{
								loader: 'css-loader',
								options: {
									importLoaders: 1,
									minimize: !options.dev
								}
							},
							{
								loader: 'postcss-loader'
							}
						]
					})
				},
				{
					test: /\.(js|es6)$/, // exclude: /node_modules/,
					include: [
						pathJoin(__dirname, 'src', 'js'),
						pathJoin(__dirname, 'node_modules', 'postcss', 'lib')
					],
					use: [{
						loader: 'babel-loader',
						options: {
							"presets": [
								["env", {
									"debug":false,
									"modules": false,
									"loose": true,
									"targets": options.es6 ? {
										node:6.5
									} : {
										browsers: packageJson.browserslist
									}
								}]
							],
							"plugins": [
								"syntax-dynamic-import"
							]
						}
					}]
				}
			]
		},
		plugins: plugins,
		devtool: false, //! DEV ? 'cheap-inline-module-source-map' : 'source-map', // Карты исходников
		resolve: {
			extensions: ['.js', '.es6']
		},
		entry: {
			main: './js/main.js',
			prism: './js/prism/prism.js',
			runtime: options.es6 ? './js/runtime.js' : ['core-js/fn/promise','./js/runtime.js']
		},
		output: {
			path: path.resolve(__dirname + '/assets/js/'),
			filename: options.es6 ? 'es6.[name].[chunkhash:6].js' : '[name].[chunkhash:6].js',
			chunkFilename: options.es6 ? 'es6.[name].[chunkhash:6].js' : '[name].[chunkhash:6].js'
		}
	};
}

let _dev = 0;

module.exports = [
	getConf({
		es6:true,
		dev: _dev
	}),
	getConf({
		es6:false,
		dev: _dev
	})
];