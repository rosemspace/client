import { TimingFunction } from './index'

export type ElasticParams = Partial<{
  frequency: number
  offset: number
  decay: number
}>

export const easeInElastic: TimingFunction = (
  timeFraction: number,
  { frequency = 3, offset = 0, decay = 6 }: ElasticParams = {}
): number =>
  timeFraction === 0 || timeFraction === 1
    ? timeFraction
    : (Math.cos(
        frequency *
          (1 - offset * (1 - timeFraction)) *
          timeFraction *
          2 *
          Math.PI
      ) *
        timeFraction) /
      Math.exp(decay * (1 - timeFraction))

export const easeOutElastic: TimingFunction = (
  timeFraction: number,
  params: ElasticParams = {}
): number => 1 - easeInElastic(1 - timeFraction, params)

// export const elasticOut (timeFraction, { frequency = 3, offset = 0, decay = 6 } = {}) =>
//   timeFraction === 0 || timeFraction === 1
//     ? timeFraction
//     : 1 -
//       Math.cos(
//         frequency *
//           (1 - offset * timeFraction) *
//           (1 - timeFraction) *
//           2 *
//           Math.PI
//       ) *
//         (1 - timeFraction) /
//         Math.exp(decay * timeFraction);
