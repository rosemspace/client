import CSSEasingDeclaration from './CSSEasingDeclaration'

export const CSS_TRANSITION_DEFAULT_PROPERTY = 'all'

export default interface CSSTransitionDeclaration extends CSSEasingDeclaration {
  readonly endEventName: 'transitionend'
  properties: string[]
}
