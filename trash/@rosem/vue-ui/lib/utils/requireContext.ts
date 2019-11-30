import fs from 'fs'
import path from 'path'

export function walkSync(directory, recursive = false, filelist = []) {
  fs.readdirSync(directory).forEach(function(file) {
    const joinedPath = path.join(directory, file)

    if (fs.statSync(joinedPath).isDirectory()) {
      if (recursive) {
        filelist = walkSync(joinedPath, filelist)
      } else {
        fs.readdirSync(joinedPath).includes('index.js')
        filelist = filelist.concat(path.join(joinedPath, 'index.js'))
      }
    } else {
      filelist = filelist.concat(joinedPath)
    }
  })

  return filelist
}

export default function requireContext(
  directory = './',
  recursive = false,
  regExp = /\.(json|js)$/
) {
  const basepath =
    directory[0] === '.'
      ? path.join(__dirname, directory) // Relative path
      : !path.isAbsolute(directory)
        ? require.resolve(directory) // Module path
        : directory // Absolute path
  const keys = walkSync(basepath, recursive)
    .filter(function(file) {
      return file.match(regExp)
    })
    .map(function(file) {
      return path.join('.', file.slice(basepath.length + 1))
    })

  const context = function(key) {
    return require(context.resolve(key))
  }

  context.resolve = function(key) {
    return path.join(directory, key)
  }

  context.keys = function() {
    return keys
  }

  return context
}
