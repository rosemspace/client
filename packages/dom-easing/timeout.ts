import {
  CSS_EASING_DEFAULT_TIMEOUT,
  CSS_EASING_VALUES_SEPARATOR,
} from './CSSEasingDeclaration'
import convertSStringToMs from './convertSStringToMs'

export function getTimeouts(timeoutsString: string): number[] {
  return (timeoutsString || CSS_EASING_DEFAULT_TIMEOUT)
    .split(CSS_EASING_VALUES_SEPARATOR)
    .map((delay: string): number => convertSStringToMs(delay))
}

export function getMaxTimeout(
  delays: number[],
  durations: number[] = []
): number {
  return Math.max(
    ...durations.map((duration, index): number => {
      // Repeat delays for rest properties
      return duration + delays[index % delays.length]
    })
  )
}
