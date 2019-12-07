export * from './array'
export * from './iterable'

// Newline can be one of
// - Carriage Return (CR, \r, on older Macs)
// - Line Feed (LF, \n, on Unices incl. Linux)
// - CR followed by LF (\r\n, on WinDOS)
export const newlineRegExp: RegExp = /\r?\n|\r/g

export const getLineIndex = (source: string, charIndex: number): number =>
  (source.substr(0, charIndex).match(newlineRegExp) || []).length

export const spliceLines = (
  source: string,
  lineIndex: number,
  deleteCount: number = 1,
  ...newLines: string[]
): string => {
  if (!deleteCount) {
    return source
  }

  const lines: string[] = source.split(newlineRegExp)

  lines.splice(lineIndex, deleteCount, ...newLines)

  return lines.join('\n')
}

export const unifyPath = (path: string): string => path.replace(/\\/gm, '/')

export const startsWithOn = (key: string): boolean =>
  key[0] === 'o' && key[1] === 'n'
