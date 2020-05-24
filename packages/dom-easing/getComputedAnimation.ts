import CSSAnimationDeclaration, {
  CSS_ANIMATION_DEFAULT_NAME,
} from './CSSAnimationDeclaration'
import { CSS_EASING_VALUES_SEPARATOR } from './CSSEasingDeclaration'
import { getMaxTimeout, getTimeouts } from './timeout'

export default function getComputedAnimation({
  animationDelay,
  animationDuration,
  animationName,
}: CSSStyleDeclaration): CSSAnimationDeclaration {
  const delays: number[] = getTimeouts(animationDelay)
  const durations: number[] = getTimeouts(animationDuration)

  return {
    endEventName: 'animationend',
    names: (animationName || CSS_ANIMATION_DEFAULT_NAME).split(
      CSS_EASING_VALUES_SEPARATOR
    ),
    delays,
    durations,
    maxDelay: Math.max(...delays),
    maxDuration: Math.max(...durations),
    timeout: getMaxTimeout(delays, durations),
  }
}
