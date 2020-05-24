import { reflect, reverse, TimingFunction } from './index'

export type BounceParams = Partial<{
  restitution: number
}>

// Bouncing physics:
// https://www.khanacademy.org/math/calculus-home/series-calc/geo-series-calc/v/bouncing-ball-distance
// http://www.sosmath.com/calculus/geoser/bounce/bounce.html
// https://physics.stackexchange.com/questions/291803/calculating-height-of-a-ball-formula-based-on-bounce
// https://physics.stackexchange.com/questions/245791/explicit-function-for-bouncing-ball
// Gravitational acceleration
// https://en.wikipedia.org/wiki/Gravitational_acceleration
// Coefficient of restitution:
// https://en.wikipedia.org/wiki/Coefficient_of_restitution
// Logarithm
// https://en.wikipedia.org/wiki/Logarithm
// https://stackoverflow.com/questions/3019278/how-can-i-specify-the-base-for-math-log-in-javascript
export function bounceIn(
  timeFraction: number,
  { restitution = 0.5 }: BounceParams = {}
): number {
  // Coefficient of restitution
  // e = Math.sqrt(restitution / H)
  // v = Math.sqrt(2 * g * h) = Math.sqrt(2 * g * restitution)
  // u = Math.sqrt(2 * g * H) = Math.sqrt(2 * g * 1)
  // (m * v ** 2) / 2 === m * g * h
  // (v ** 2) / 2 === g * restitution
  // (m * u ** 2) / 2 === m * g * H
  // (u ** 2) / 2 === g * 1
  // e = u / v
  // u = e * v
  // g = 8 * H * (e / T) ** 2
  // (m * g ** 2) / 2 = m * g * H
  // g * g = 2 * g * H
  // g = 2 * H
  const e = Math.sqrt(restitution)
  const e1 = 1 - e
  // const timeCorrection = (1 + e) / 2
  const timeCorrection = 1 - e1 / 2
  const t = timeFraction * timeCorrection
  // 2 ** x = t
  // 2 ** y = e
  // Math.floor(x / y) = numberOfBounces
  // e ** (x / y) = t
  const currentNumberOfBounces = Math.floor(Math.log(t) / Math.log(e))
  // e ** currentNumberOfBouncesWithoutFloor = t
  const currentRestitution = e ** currentNumberOfBounces
  const deltaTimeFraction = (currentRestitution - t) / e1
  // console.log(Math.floor(t / e * 100) * Math.SQRT2, currentRestitution)

  return 4 * deltaTimeFraction * (currentRestitution - deltaTimeFraction)
}

function log(a: number, b: number): number {
  return Math.log(b) / Math.log(a)
}

// g 2^1 - t 3
// g 2^3 - t 1.5
// g 2^5 - t 0.75
const g = 2 //18
const h = 1
const t = 1

// export const bounceOut: TimingFunction = reverse(bounceIn)
export function bounceOut(
  timeFraction: number,
  { restitution = 0.25 }: BounceParams = {}
): number {
  //0.25 - 2x
  const coefficientOfRestitution = Math.sqrt(restitution)
  const gravity_ = 2 / (1 - coefficientOfRestitution)
  const gravity =
    (2 * h) /
    (t / (1 + 2 * (Math.sqrt(restitution) / (1 - Math.sqrt(restitution))))) ** 2
  const normalizedTimeFraction = 1 - timeFraction + timeFraction / gravity_
  const height = restitution / coefficientOfRestitution ** 2
  // const gravity = (2 * (h - ht)) / t1 ** 2
  const t0 = 0
  const t1 = /*t0 + 2 * */ Math.sqrt(((2 * h) / g) * restitution ** 0)
  const t2 = /*t1 + 2 * */ Math.sqrt(((2 * h) / g) * restitution ** 1)
  const t3 = /*t2 + 2 * */ Math.sqrt(((2 * h) / g) * restitution ** 2)
  const t4 = /*t3 + 2 * */ Math.sqrt(((2 * h) / g) * restitution ** 3)
  const t5 = /*t4 + 2 * */ Math.sqrt(((2 * h) / g) * restitution ** 4)
  // ((timeFraction / 2) ** 2) / ((2 * h) / g) = restitution ** x
  const numberOfBouncesCustom = Math.floor(
    log(restitution, ((timeFraction / (4 * h)) * gravity * timeFraction) / 2)
  )
  const numberOfBounces = Math.floor(
    log(restitution, ((restitution - 1) * gravity * timeFraction) / 2 + 1)
  )
  const time =
    Math.sqrt((2 * h) / g) *
    (1 + 2 * (Math.sqrt(restitution) / (1 - Math.sqrt(restitution))))

  console.log(numberOfBouncesCustom)

  // return g / 2 * (timeFraction ** 2)
  const rPowNob = restitution ** numberOfBounces
  const ic = timeFraction - (rPowNob - 1) / (restitution - 1)

  return (ic / 2) * (rPowNob - ic)
}

export const bounceInOut: TimingFunction = reflect(bounceIn)

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
