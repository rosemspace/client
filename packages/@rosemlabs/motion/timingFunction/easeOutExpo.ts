import { TimingFunction } from './index'

// return 1 - !~~timeFraction * 2**(-10 * timeFraction);

export const easeOutExpo: TimingFunction = (timeFraction: number): number =>
  1 - Number(!~~timeFraction) * Math.pow(2, -10 * timeFraction)
