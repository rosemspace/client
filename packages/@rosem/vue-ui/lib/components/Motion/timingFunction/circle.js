export const circleIn = timeFraction =>
  1 - Math.sqrt(1 - timeFraction * timeFraction);

export const circleOut = timeFraction =>
  Math.sqrt(1 - --timeFraction * timeFraction);

export const circleInOut = timeFraction =>
  ((timeFraction *= 2) <= 1
    ? circleIn(timeFraction)
    : 1 + Math.sqrt(1 - (timeFraction -= 2) * timeFraction)) / 2;
