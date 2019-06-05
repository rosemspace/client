import { RawSourceMap, SourceMapGenerator } from 'source-map'

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/

export default function generateSourceMap(
  file: string,
  source: string,
  generated: string,
  sourceRoot: string,
  pad: boolean = false
): RawSourceMap {
  const map: SourceMapGenerator = new SourceMapGenerator({
    file: file.replace(/\\/g, '/'),
    sourceRoot: sourceRoot.replace(/\\/g, '/'),
  })
  let offset: number = 0

  //todo
  if (!pad) {
    offset =
      source
        .split(generated)[0]
        .split(splitRE).length - 1
  }

  map.setSourceContent(file, source)
  generated.split(splitRE).forEach(
    (line: string, index: number): void => {
      if (!emptyRE.test(line)) {
        map.addMapping({
          source: file,
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
