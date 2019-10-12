import { RawSourceMap, SourceMapGenerator } from 'source-map'

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

export default function generateSourceMap(
  filename: string,
  source: string,
  generated: string,
  sourceRoot: string,
  offset: number = 0
): RawSourceMap {
  const map: SourceMapGenerator = new SourceMapGenerator({
    file: filename.replace(/\\/g, '/'),
    sourceRoot: sourceRoot.replace(/\\/g, '/'),
  })

  map.setSourceContent(filename, source)
  generated.split(splitRE).forEach(
    (line: string, index: number): void => {
      if (!emptyRE.test(line)) {
        map.addMapping({
          source: filename,
          original: {
            line: index + 1 + offset,
            column: 0,
          },
          generated: {
            line: index + 1,
            column: 0,
          },
        })
      }
    }
  )

  return JSON.parse(map.toString())
}
