export const circleIn = timeFraction =>
  1 - Math.sqrt(1 - timeFraction * timeFraction)

export const circleOut = timeFraction =>
  Math.sqrt(1 - --timeFraction * timeFraction)

export const circleInOut = timeFraction =>
  0.5 *
  (timeFraction <= 0.5
    ? 1 - Math.sqrt(1 - 4 * timeFraction * timeFraction)
    : 1 + Math.sqrt(1 - 4 * --timeFraction * timeFraction))
