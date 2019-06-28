import {
  CSS_EASING_DEFAULT_TIMEOUT,
  CSS_EASING_VALUES_SEPARATOR,
} from './CSSEasingDeclaration'
import CSSAnimationDeclaration, {
  CSS_ANIMATION_DEFAULT_NAME,
} from './CSSAnimationDeclaration'
import getTimeout from './getTimeout'

export default function getComputedAnimation({
  animationDelay,
  animationDuration,
  animationName,
}: CSSStyleDeclaration): CSSAnimationDeclaration {
  const delays = (animationDelay || CSS_EASING_DEFAULT_TIMEOUT).split(
    CSS_EASING_VALUES_SEPARATOR
  )
  const durations = (animationDuration || CSS_EASING_DEFAULT_TIMEOUT).split(
    CSS_EASING_VALUES_SEPARATOR
  )

  return {
    endEventName: 'animationend',
    names: (animationName || CSS_ANIMATION_DEFAULT_NAME).split(
      CSS_EASING_VALUES_SEPARATOR
    ),
    delays,
    durations,
    timeout: getTimeout(delays, durations),
  }
}
