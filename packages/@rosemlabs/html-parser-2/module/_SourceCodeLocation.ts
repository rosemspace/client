export type Range = {
  start: number
  end: number
}

export type SourceCodeLocation = Partial<{
  __line: Range
  __column: Range
}>
