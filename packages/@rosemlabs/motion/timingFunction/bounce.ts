import { reflect, reverse, TimingFunction } from './index'

export type BounceParams = Partial<{
  restitution: number
}>

// Bouncing physics:
// https://www.khanacademy.org/math/calculus-home/series-calc/geo-series-calc/v/bouncing-ball-distance
// http://www.sosmath.com/calculus/geoser/bounce/bounce.html
// https://physics.stackexchange.com/questions/291803/calculating-height-of-a-ball-formula-based-on-bounce
// https://physics.stackexchange.com/questions/245791/explicit-function-for-bouncing-ball
// Coefficient of restitution:
// https://en.wikipedia.org/wiki/Coefficient_of_restitution
export function bounceOut(
  timeFraction: number,
  { restitution = 0.25 }: BounceParams = {}
): number {
  const computedRestitution = Math.sqrt(restitution)
  const gravity = 2 / (1 - computedRestitution)
  const normalizedTimeFraction = timeFraction - (timeFraction - 1) / gravity
  const currentNumberOfBounces = Math.floor(
    Math.log(
      ((computedRestitution - 1) * gravity * normalizedTimeFraction) / 2 + 1
    ) / Math.log(computedRestitution)
  )
  const currentRestitution = computedRestitution ** currentNumberOfBounces
  const deltaTimeFraction =
    normalizedTimeFraction -
    ((2 / gravity) * (currentRestitution - 1)) / (computedRestitution - 1)

  return (
    1 -
    2 *
      gravity *
      (currentRestitution * deltaTimeFraction -
        (gravity / 2) * deltaTimeFraction ** 2)
  )
}

export const bounceIn: TimingFunction = reverse(bounceOut)

export const bounceOutIn: TimingFunction = reflect(bounceOut)

// export default timeFraction =>
//   [
//     timeFraction,
//     timeFraction < 1 / 2.75
//       ? 7.5625 * timeFraction * timeFraction
//       : timeFraction < 2 / 2.75
//         ? 7.5625 * (timeFraction -= 1.5 / 2.75) * timeFraction + 0.75
//         : timeFraction < 2.5 / 2.75
//           ? 7.5625 * (timeFraction -= 2.25 / 2.75) * timeFraction + 0.9375
//           : 7.5625 * (timeFraction -= 2.625 / 2.75) * timeFraction + 0.984375
//   ][1];
