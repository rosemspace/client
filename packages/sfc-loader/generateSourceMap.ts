import { RawSourceMap, SourceMapGenerator } from 'source-map'
import { newlineRegExp, unifyPath } from '@rosemlabs/common-util'

const parse = JSON.parse
const emptyLineRegExp: RegExp = /^(?:\/\/)?\s*$/

export default function generateSourceMap(
  filename: string,
  source: string,
  generated: string,
  sourceRoot: string,
  offsetLineIndex: number = 0
): RawSourceMap {
  const map: SourceMapGenerator = new SourceMapGenerator({
    file: unifyPath(filename),
    sourceRoot: unifyPath(sourceRoot),
  })

  map.setSourceContent(filename, source)
  generated
    .split(newlineRegExp)
    .forEach((line: string, index: number): void => {
      // todo: why do we need this empty line regexp?
      if (!emptyLineRegExp.test(line)) {
        map.addMapping({
          source: filename,
          original: {
            line: index + 1 + offsetLineIndex,
            column: 0,
          },
          generated: {
            line: index + 1,
            column: 0,
          },
        })
      }
    })

  return parse(map.toString())
}
