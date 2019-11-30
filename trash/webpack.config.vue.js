module.exports = {
  // IOPreset
  context: 'D:\\Code\\rosem\\client',
  entry: {
    index: [
      'D:\\Code\\rosem\\client\\packages\\@rosem\\app\\index.ts'
    ],
  },
  output: {
    path: 'D:\\Code\\rosem\\client\\dist',
    filename: '[name].js',
    publicPath: '/',
    globalObject: 'this'
  },
  // DevPreset
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  node: {
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  resolve: {
    alias: {
      '@': 'D:\\Code\\rosem\\client\\src',
      vue$: 'vue/dist/vue.runtime.esm.js',
      '@rosem': 'D:\\Code\\rosem\\client\\packages\\@rosem',
      '@rosem-util': 'D:\\Code\\rosem\\client\\packages\\@rosem-util'
    },
    extensions: [
      '.mjs',
      '.js',
      '.jsx',
      '.vue',
      '.json',
      '.wasm',
      '.ts',
      '.tsx'
    ],
    modules: [
      'node_modules',
      'D:\\Code\\rosem\\client\\node_modules',
      'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-service\\node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-plugin-typescript\\node_modules',
      'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-plugin-eslint\\node_modules',
      'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-plugin-babel\\node_modules',
      'node_modules',
      'D:\\Code\\rosem\\client\\node_modules',
      'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-service\\node_modules'
    ]
  },
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      /* config.module.rule('vue') */
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\vue-loader',
              cacheIdentifier: 'c3d74302'
            }
          },
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false
              },
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\vue-loader',
              cacheIdentifier: 'c3d74302'
            }
          }
        ]
      },
      /* config.module.rule('images') */
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
                  name: 'img/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      /* config.module.rule('svg') */
      {
        test: /\.(svg)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      /* config.module.rule('media') */
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      /* config.module.rule('fonts') */
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name].[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      /* config.module.rule('pug') */
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-plain-loader'
          }
        ]
      },
      /* config.module.rule('css') */
      {
        test: /\.css$/,
        oneOf: [
          /* config.module.rule('css').oneOf('vue-modules') */
          {
            resourceQuery: /module/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('css').oneOf('vue') */
          {
            resourceQuery: /\?vue/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('css').oneOf('normal-modules') */
          {
            test: /\.module\.\w+$/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('css').oneOf('normal') */
          {
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          }
        ]
      },
      /* config.module.rule('postcss') */
      {
        test: /\.p(ost)?css$/,
        oneOf: [
          /* config.module.rule('postcss').oneOf('vue-modules') */
          {
            resourceQuery: /module/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('postcss').oneOf('vue') */
          {
            resourceQuery: /\?vue/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('postcss').oneOf('normal-modules') */
          {
            test: /\.module\.\w+$/,
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2,
                  modules: true,
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          /* config.module.rule('postcss').oneOf('normal') */
          {
            use: [
              {
                loader: 'vue-style-loader',
                options: {
                  sourceMap: true,
                  shadowMode: false
                }
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ]
          }
        ]
      },
      /* config.module.rule('js') */
      {
        test: /\.m?jsx?$/,
        exclude: [
          function () { /* omitted long function */ }
        ],
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\babel-loader',
              cacheIdentifier: '14be64da'
            }
          },
          {
            loader: 'babel-loader'
          }
        ]
      },
      /* config.module.rule('eslint') */
      {
        enforce: 'pre',
        test: /\.(vue|(j|t)sx?|gql|graphql)$/,
        exclude: [
          /node_modules/,
          'D:\\Code\\rosem\\client\\node_modules\\@vue\\cli-service\\lib'
        ],
        use: [
          {
            loader: 'eslint-loader',
            options: {
              extensions: [
                '.js',
                '.jsx',
                '.vue',
                '.ts',
                '.tsx'
              ],
              cache: true,
              cacheIdentifier: '8b02227eundefined',
              emitWarning: true,
              emitError: false,
              eslintPath: 'D:\\Code\\rosem\\client\\node_modules\\eslint\\lib\\api.js',
              formatter: function () { /* omitted long function */ }
            }
          }
        ]
      },
      /* config.module.rule('ts') */
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\ts-loader',
              cacheIdentifier: 'fa2c5396'
            }
          },
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [
                '\\.vue$'
              ],
              happyPackMode: false
            }
          }
        ]
      },
      /* config.module.rule('tsx') */
      {
        test: /\.tsx$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\ts-loader',
              cacheIdentifier: 'fa2c5396'
            }
          },
          {
            loader: 'babel-loader'
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: false,
              appendTsxSuffixTo: [
                '\\.vue$'
              ]
            }
          }
        ]
      },
      /* config.module.rule('gql') */
      {
        test: /\.(gql|graphql)$/,
        include: [
          'D:\\Code\\rosem\\client\\src',
          'D:\\Code\\rosem\\client\\tests'
        ],
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: 'D:\\Code\\rosem\\client\\node_modules\\.cache\\cache-loader'
            }
          },
          {
            loader: 'graphql-tag/loader'
          }
        ]
      },
      /* config.module.rule('mjs') */
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: [
          /node_modules/
        ]
      }
    ]
  },
  plugins: [
    /* config.plugin('vue-loader') */
    new VueLoaderPlugin(),
    /* config.plugin('define') */
    new DefinePlugin(
      {
        'process.env': {
          NODE_ENV: '"development"',
          BASE_URL: '"/"'
        }
      }
    ),
    /* config.plugin('case-sensitive-paths') */
    new CaseSensitivePathsPlugin(),
    /* config.plugin('friendly-errors') */
    new FriendlyErrorsWebpackPlugin(
      {
        additionalTransformers: [
          function () { /* omitted long function */ }
        ],
        additionalFormatters: [
          function () { /* omitted long function */ }
        ]
      }
    ),
    /* config.plugin('hmr') */
    new HotModuleReplacementPlugin(),
    /* config.plugin('progress') */
    new ProgressPlugin(),
    /* config.plugin('html-index') */
    new HtmlWebpackPlugin(
      {
        templateParameters: function () { /* omitted long function */ },
        chunks: [
          'chunk-vendors',
          'chunk-common',
          'index'
        ],
        template: 'packages/@rosemlabs/app/index.html',
        filename: 'index.html',
        title: 'Rosem | Home Page'
      }
    ),
    /* config.plugin('preload-index') */
    new PreloadPlugin(
      {
        rel: 'preload',
        includeHtmlNames: [
          'index.html'
        ],
        include: {
          type: 'initial',
          entries: [
            'index'
          ]
        },
        fileBlacklist: [
          /\.map$/,
          /hot-update\.js$/
        ]
      }
    ),
    /* config.plugin('prefetch-index') */
    new PreloadPlugin(
      {
        rel: 'prefetch',
        includeHtmlNames: [
          'index.html'
        ],
        include: {
          type: 'asyncChunks',
          entries: [
            'index'
          ]
        }
      }
    ),
    /* config.plugin('copy') */
    new CopyWebpackPlugin(
      [
        {
          from: 'D:\\Code\\rosem\\client\\public',
          to: 'D:\\Code\\rosem\\client\\dist',
          toType: 'dir',
          ignore: [
            '.DS_Store',
            'packages/@rosemlabs/app/index.html'
          ]
        }
      ]
    ),
    /* config.plugin('pwa') */
    new HtmlPwaPlugin(
      {
        name: 'rosem'
      }
    ),
    /* config.plugin('fork-ts-checker') */
    new ForkTsCheckerWebpackPlugin(
      {
        vue: true,
        tslint: false,
        formatter: 'codeframe',
        checkSyntacticErrors: false
      }
    )
  ],
}
