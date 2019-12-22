export const CSS_EASING_VALUES_SEPARATOR = ', '

export const CSS_EASING_DEFAULT_TIMEOUT = '0s'

export default interface CSSEasingDeclaration {
  readonly endEventName: string
  delays: number[]
  durations: number[]
  timeout: number
}
