import {
  CSS_EASING_DEFAULT_TIMEOUT,
  CSS_EASING_VALUES_SEPARATOR,
} from './CSSEasingDeclaration'
import { convertSStringToMs } from '@rosemlabs/time-util'

export function getTimeouts(timeoutsString: string): number[] {
  return (timeoutsString || CSS_EASING_DEFAULT_TIMEOUT)
    .split(CSS_EASING_VALUES_SEPARATOR)
    .map((delay: string): number => convertSStringToMs(delay))
}

export function getMaxTimeout(
  delays: number[],
  durations: number[] = []
): number {
  if (delays.length < durations.length) {
    // if one delay set for all transitions
    delays.fill(delays[0], 0, durations.length)
  }

  return Math.max.apply(
    null,
    durations.map((duration, index): number => {
      return duration + delays[index]
    })
  )
}
