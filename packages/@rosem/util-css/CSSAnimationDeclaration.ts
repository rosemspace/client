import CSSEasingDeclaration from './CSSEasingDeclaration'

export const CSS_ANIMATION_DEFAULT_NAME: string = 'none'

export default interface CSSAnimationDeclaration extends CSSEasingDeclaration {
  readonly endEventName: 'animationend'
  names: string[]
}
