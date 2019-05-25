//node --experimental-modules --require ts-node/register --require tsconfig-paths/register ./node_modules/webpack/bin/webpack.js --config webpack.config.ts
//cross-env TS_NODE_PROJECT=\"tsconfig.webpack.json\" webpack
//cross-env TS_NODE_FILES=true webpack

const moduleAlias = require('module-alias')
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { resolve } from 'path'
import { Configuration } from 'webpack'

// declare global {
//   interface ImportMeta {
//     url: string
//   }
// }
// const __dirname = import.meta.url
declare var __dirname: string

const packages: string = resolve(__dirname, 'packages/@rosem')
const tsconfigPathsPlugin = new TsconfigPathsPlugin()

moduleAlias.addAlias('@rosem', packages)

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  // node: {
  //   console: true,
  // },
  context: resolve(__dirname),
  entry: './packages/@rosem/app/index.ts',
  // entry: './packages/@rosem/vue-app/main.ts',
  output: {
    filename: 'main.js',
    path: resolve(__dirname, 'dist'),
  },
  resolve: {
    // mainFiles: ['index'],
    modules: ['node_modules', packages],
    extensions: ['.es', '.es6', '.js', '.json', '.jsx', '.mjs', '.sfc', '.ts', '.tsx'],
    plugins: [tsconfigPathsPlugin],
  },
  resolveLoader: {
    modules: ['node_modules', packages],
    extensions: ['.es', '.es6', '.js', '.mjs', '.ts'],
    plugins: [tsconfigPathsPlugin],
  },
  module: {
    rules: [
      {
        test: /\.sfc$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: '@rosem/sfc-loader',
            // loader: path.resolve(__dirname, './packages/@rosem/sfc-loader/index.ts'),
            options: {},
          }
        ],
      },
      {
        test: /\.m?jsx?$/,
        // exclude: [
        //   function () { /* omitted long function */ }
        // ],
        use: [
          // {
          //   loader: 'cache-loader',
          //   options: {
          //     cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\babel-loader',
          //     cacheIdentifier: '14be64da'
          //   }
          // },
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          // {
          //   loader: 'cache-loader',
          //   options: {
          //     cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\ts-loader',
          //     cacheIdentifier: 'fa2c5396'
          //   }
          // },
          {
            loader: 'babel-loader',
          //   options: {
          //     cacheDirectory: true,
          //   }
          },
          {
            loader: 'ts-loader',
            options: {
              // transpileOnly: true, // false by default
              appendTsSuffixTo: [
                '\\.sfc$',
              ],
              // happyPackMode: false // false by default
            }
          }
        ]
      },
    ],
  },
} as Configuration