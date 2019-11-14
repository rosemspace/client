import { TimingFunction } from './index'

export const circleIn: TimingFunction = (timeFraction: number): number =>
  1 - Math.sqrt(1 - timeFraction * timeFraction)

export const circleOut: TimingFunction = (timeFraction: number): number =>
  Math.sqrt(1 - --timeFraction * timeFraction)

export const circleInOut: TimingFunction = (timeFraction: number): number =>
  0.5 *
  (timeFraction <= 0.5
    ? 1 - Math.sqrt(1 - 4 * timeFraction * timeFraction)
    : 1 + Math.sqrt(1 - 4 * --timeFraction * timeFraction))
