//node --experimental-modules --require ts-node/register --require tsconfig-paths/register ./node_modules/webpack/bin/webpack.js --config webpack.config.ts
//cross-env TS_NODE_PROJECT=\"tsconfig.webpack.json\" webpack
//cross-env TS_NODE_FILES=true webpack

import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { resolve } from 'path'
import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin,
  ProgressPlugin,
} from 'webpack'
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
// import { isProduction } from '@rosemlabs/env-util'
import SFCLoaderPlugin from '@rosemlabs/sfc-loader/SFCLoaderPlugin'

const isProduction: boolean = 'production' === process.env.NODE_ENV
const dir = (path: string): string => resolve(__dirname, path)

const jsEntry: string = dir('packages/html-parser/test.ts')
const htmlEntry: string = dir('packages/battle-city/index.html')

const babelLoader = {
  loader: 'babel-loader',
  // options: {
  //   configFile: path('babel.config.ts'),
  // },
}

export default {
  mode: isProduction ? 'production' : 'development',
  // mode: 'development',
  // cache: true,
  // `cheap-module-eval-source-map` is bad for `sfc` files
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'eval-source-map',
  // node: {
  //   console: true,
  // },
  context: dir('.'),
  entry: jsEntry,
  output: {
    filename: 'main.js',
    path: dir('dist'),
  },
  resolve: {
    // mainFiles: ['index'],
    extensions: [
      '.es',
      '.es6',
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.sfc',
      '.ts',
      '.tsx',
      '.glsl',
    ],
    // Needed for Webpack to resolve modules on client side.
    // Can't use it due to a bug
    // https://github.com/dividab/tsconfig-paths/issues/85
    // plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@rosemlabs': dir('packages'),
    },
  },
  resolveLoader: {
    extensions: ['.es', '.es6', '.js', '.mjs', '.ts'],
    // No need to use TsconfigPathsPlugin with yarn workspaces
    // plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        // resourceQuery: /^\?sfc&block=script&lang=js/,
        exclude: /node_modules/,
        // exclude: [
        //   function () { /* omitted long function */ }
        // ],
        use: [
          // {
          //   loader: 'cache-loader',
          //   options: {
          //     cacheDirectory: 'D:\\Code\\rosemlabs\\client\\node_modules\\.cache\\babel-loader',
          //     cacheIdentifier: '14be64da'
          //   }
          // },
          babelLoader,
        ],
      },
      {
        test: /\.m?tsx?$/,
        // resourceQuery: /^\?sfc&block=script&lang=ts/,
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'cache-loader',
          //   options: {
          //     cacheDirectory: 'D:\\Code\\rosemlabs\\client\\node_modules\\.cache\\ts-loader',
          //     cacheIdentifier: 'fa2c5396'
          //   }
          // },
          babelLoader,
          {
            loader: 'ts-loader',
            options: {
              // todo use isProduction instead of true
              // transpileOnly: true, // false by default
              appendTsSuffixTo: ['\\.vue$', '\\.sfc$', '\\.glsl$'],
              // happyPackMode: false // false by default
            },
          },
        ],
      },
      {
        test: /\.sfc\.html$/,
        // resourceQuery: /^\?sfc&.*?&lang=html&/,
        exclude: /node_modules/,
        use: [
          babelLoader,
          {
            loader: '@rosemlabs/ui-template-loader',
          },
          // {
          //   loader: 'html-loader',
          //   options: {
          //     // minimize: true,
          //   },
          // },
        ],
      },
      // {
      //   test: /\.html$/,
      //   exclude: /node_modules/,
      //   use: [
      //     {
      //       loader: 'html-loader',
      //       options: {
      //         // minimize: true,
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.(p(ost)?)?css$/,
        // resourceQuery: /^\?sfc&block=style&lang=css/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          // {
          //   loader: '@rosemlabs/scoped-css-loader',
          //   options: {
          //     sourceMap: true,
          //   },
          // },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.sfc$/,
        use: [
          {
            loader: '@rosemlabs/sfc-loader',
            options: {
              sourceMap: true,
              // noPad: true,
              // exportName: 'descriptor',
            },
          },
        ],
        // oneOf: [
        //   {}
        // ]
      },
      {
        // test: /\.json$/,
        resourceQuery: /^\?sfc&block=i18n/,
        // Need for custom json loader,
        // because webpack have built-in loader for json
        type: 'javascript/auto',
        use: 'json-loader',
      },
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader',
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
    ],
  },
  devServer: {
    contentBase: dir('dist'),
    publicPath: dir('/'),
    hot: !isProduction,
    compress: isProduction,
    port: 8080,
  },
  plugins: [
    // new VueLoaderPlugin(),
    new SFCLoaderPlugin({
      fileExtension: 'sfc',
      // blockLangMap: {
      //   i18n: 'json',
      // }
    }),
    /* config.plugin('define') */
    new DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
        BASE_URL: '"/"',
      },
    }),
    /* config.plugin('case-sensitive-paths') */
    new CaseSensitivePathsPlugin(),
    /* config.plugin('friendly-errors') */
    new FriendlyErrorsWebpackPlugin({
      // additionalTransformers: [
      //   /* omitted long function */
      //   (): string[] => [],
      // ],
      // additionalFormatters: [
      //   /* omitted long function */
      //   (): string[] => [],
      // ],
    }),
    /* config.plugin('hmr') */
    new HotModuleReplacementPlugin(),
    /* config.plugin('progress') */
    new ProgressPlugin(),
    /* config.plugin('html-index') */
    new HtmlWebpackPlugin({
      // templateParameters: function () { /* omitted long function */ },
      // chunks: [
      //   'chunk-vendors',
      //   'chunk-common',
      //   'index'
      // ],
      template: htmlEntry,
      filename: 'index.html',
      title: 'Rosem | Home Page',
    }),
    // new ForkTsCheckerWebpackPlugin(
    //   {
    //     vue: true,
    //     formatter: 'codeframe',
    //     checkSyntacticErrors: false
    //   }
    // ),
  ],
} as Configuration
