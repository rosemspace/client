import {
  CSS_EASING_DEFAULT_TIMEOUT,
  CSS_EASING_VALUES_SEPARATOR,
} from './CSSEasingDeclaration'
import CSSTransitionDeclaration, {
  CSS_TRANSITION_DEFAULT_PROPERTY,
} from './CSSTransitionDeclaration'
import getTimeout from './getTimeout'

export default function getComputedTransition({
  transitionDelay,
  transitionDuration,
  transitionProperty,
}: CSSStyleDeclaration): CSSTransitionDeclaration {
  const delays: string[] = (
    transitionDelay || CSS_EASING_DEFAULT_TIMEOUT
  ).split(CSS_EASING_VALUES_SEPARATOR)
  const durations: string[] = (
    transitionDuration || CSS_EASING_DEFAULT_TIMEOUT
  ).split(CSS_EASING_VALUES_SEPARATOR)

  return {
    endEventName: 'transitionend',
    properties: (transitionProperty || CSS_TRANSITION_DEFAULT_PROPERTY).split(
      CSS_EASING_VALUES_SEPARATOR
    ),
    delays,
    durations,
    timeout: getTimeout(delays, durations),
  }
}
