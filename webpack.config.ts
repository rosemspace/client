//node --experimental-modules --require ts-node/register --require tsconfig-paths/register ./node_modules/webpack/bin/webpack.js --config webpack.config.ts
//cross-env TS_NODE_PROJECT=\"tsconfig.webpack.json\" webpack
//cross-env TS_NODE_FILES=true webpack

import { resolve } from 'path'
import { Configuration } from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import SFCLoaderPlugin from '@rosemlab/sfc-loader/SFCLoaderPlugin'

const path: (path: string) => string = (path: string): string =>
  resolve(__dirname, path)

export default {
  // mode: 'development',
  // cache: true,
  devtool: 'cheap-module-eval-source-map',
  // devtool: 'eval-source-map',
  // node: {
  //   console: true,
  // },
  context: path('packages'),
  entry: '@rosemlab/app/index.ts',
  output: {
    filename: 'main.js',
    path: path('dist'),
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
    ],
    // Needed for Webpack to resolve modules on client side
    plugins: [new TsconfigPathsPlugin()],
  },
  resolveLoader: {
    extensions: ['.es', '.es6', '.js', '.mjs', '.ts'],
    // No need to use TsconfigPathsPlugin as TypeScript resolves loaders itself
    // based on tsconfig.json
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
          //     cacheDirectory: 'D:\\Code\\rosemlab\\client\\node_modules\\.cache\\babel-loader',
          //     cacheIdentifier: '14be64da'
          //   }
          // },
          {
            loader: 'babel-loader',
          },
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
          //     cacheDirectory: 'D:\\Code\\rosemlab\\client\\node_modules\\.cache\\ts-loader',
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
              appendTsSuffixTo: ['\\.sfc$'],
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
          {
            loader: 'babel-loader',
          },
          {
            loader: '@rosemlab/ui-template-loader',
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
          //   loader: '@rosemlab/scoped-css-loader',
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
            loader: '@rosemlab/sfc-loader',
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
    ],
  },
  plugins: [
    new SFCLoaderPlugin({
      fileExtension: 'sfc',
      // blockLangMap: {
      //   i18n: 'json',
      // }
    }),
  ],
} as Configuration
