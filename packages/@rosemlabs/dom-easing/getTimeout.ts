import { convertSStringToMs } from '@rosemlabs/time-util'

export default function getTimeout(
  delays: string[],
  durations: string[] = []
): number {
  if (delays.length < durations.length) {
    // if one delay set for all transitions
    delays.fill(delays[0], 0, durations.length)
  }

  return Math.max.apply(
    null,
    durations.map(function(duration, index) {
      return convertSStringToMs(duration) + convertSStringToMs(delays[index])
    })
  )
}
