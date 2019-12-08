import { reverse, TimingFunction } from './index'

//2^(10*t)
//0.25 = 0.25 - 1 = -0.75 = 0.00552427172801990253438159657894
// 0.5 = 0.5  - 1 = -0.5  = 0.03125
//0.75 = 0.75 - 1 = -0.25 = 0.17677669529663688110021109052621
//1024^x-x=0
export const easeInExpo: TimingFunction = (
  timeFraction: number,
  { q = 0 } = {}
): number => Number(!~~--timeFraction) * (2 + q) ** (10 * timeFraction)

export const easeOutExpo: TimingFunction = reverse(easeInExpo)
