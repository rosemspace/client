const bezier = (timeFraction, points) => {
  if (points.length < 2) {
    return points[0]
  }

  let nextPoints = []

  for (let index = 0; index < points.length - 1; ++index) {
    nextPoints.push([
      points[index][0] +
        (points[index + 1][0] - points[index][0]) * timeFraction,
      points[index][1] +
        (points[index + 1][1] - points[index][1]) * timeFraction,
    ])
  }

  return bezier(timeFraction, nextPoints)
}

export default bezier

export const quardBezier = (timeFraction, points) => [
  (1 - points[0]) * timeFraction,
  (1 - points[1]) * timeFraction,
]

export const cubicBezier = (timeFraction, points) =>
  bezier(timeFraction, [[0, 0], ...points, [1, 1]])

const bezier_wrong = (timeFraction, points) =>
  points.length < 2
    ? points[0]
    : bezier_wrong(
        timeFraction,
        points.map(
          (point, index) => point + (points[index + 1] - point) * timeFraction
        )
      )
