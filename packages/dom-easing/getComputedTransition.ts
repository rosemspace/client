import { CSS_EASING_VALUES_SEPARATOR } from './CSSEasingDeclaration'
import CSSTransitionDeclaration, {
  CSS_TRANSITION_DEFAULT_PROPERTY,
} from './CSSTransitionDeclaration'
import { getMaxTimeout, getTimeouts } from './timeout'

export default function getComputedTransition({
  transitionDelay,
  transitionDuration,
  transitionProperty,
}: CSSStyleDeclaration): CSSTransitionDeclaration {
  const delays: number[] = getTimeouts(transitionDelay)
  const durations: number[] = getTimeouts(transitionDuration)

  return {
    endEventName: 'transitionend',
    properties: (transitionProperty || CSS_TRANSITION_DEFAULT_PROPERTY).split(
      CSS_EASING_VALUES_SEPARATOR
    ),
    delays,
    durations,
    maxDelay: Math.max(...delays),
    maxDuration: Math.max(...durations),
    timeout: getMaxTimeout(delays, durations),
  }
}
