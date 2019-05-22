export default interface SFCBlock {
  tagName: string // instead of type
  content: string
  attrs: Record<string, string>
  type?: string // instead of lang
  src?: string
  global?: boolean // instead of "scoped", should be scoped by default
  module?: string | boolean
  matchStart: number
  matchEnd: number
}
