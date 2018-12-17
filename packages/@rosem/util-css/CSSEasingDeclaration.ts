export const CSS_EASING_VALUES_SEPARATOR: string = ', '
export const CSS_EASING_DEFAULT_TIMEOUT: string = '0s'

export default interface CSSEasingDeclaration {
  readonly endEventName: string
  delays: string[]
  durations: string[]
  timeout: number
}
