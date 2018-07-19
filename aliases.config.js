const aliases = {
  '@rosem': 'src/@rosem',
}

module.exports = {
  webpack: {},
  jest: {},
}

for (const alias in aliases) {
  module.exports.jest['^' + alias + '/(.*)$'] =
    '<rootDir>/' + aliases[alias] + '/$1'
}
