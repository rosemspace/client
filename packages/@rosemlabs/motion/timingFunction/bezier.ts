import { TimingFunction2D } from './index'

export type BezierParams = number[][]

export type QuardBezier2DParams = number[]

const bezier2D: TimingFunction2D = (
  timeFraction: number,
  points: BezierParams
): number[] => {
  if (points.length < 2) {
    return points[0]
  }

  const nextPoints: BezierParams = []

  for (let index = 0; index < points.length; ++index) {
    nextPoints.push([
      points[index][0] +
        (points[index + 1][0] - points[index][0]) * timeFraction,
      points[index][1] +
        (points[index + 1][1] - points[index][1]) * timeFraction,
    ])
  }

  return bezier2D(timeFraction, nextPoints)
}

export default bezier2D

export const quardBezier2D: TimingFunction2D = (
  timeFraction: number,
  points: number[]
): number[] => [(1 - points[0]) * timeFraction, (1 - points[1]) * timeFraction]

export const cubicBezier2D: TimingFunction2D = (
  timeFraction: number,
  points: BezierParams
): number[] => bezier2D(timeFraction, [[0, 0], ...points, [1, 1]])

const bezier_wrong = (timeFraction: number, points: number[]): number =>
  points.length < 2
    ? points[0]
    : bezier_wrong(
        timeFraction,
        points.map(
          (point, index) => point + (points[index + 1] - point) * timeFraction
        )
      )
