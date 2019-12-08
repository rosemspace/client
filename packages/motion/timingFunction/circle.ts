import { reflect, reverse, TimingFunction } from './index'

const sqrt = Math.sqrt

export const circleIn: TimingFunction = (timeFraction: number): number =>
  1 - sqrt(1 - timeFraction * timeFraction)

export const circleOut: TimingFunction = (timeFraction: number): number =>
  sqrt(1 - --timeFraction * timeFraction)

export const circleInOut: TimingFunction = reflect(circleIn)

export const circleOutIn: TimingFunction = reflect(circleOut)
