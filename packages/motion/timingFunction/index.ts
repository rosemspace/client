export interface TimingFunction extends Function {
  (timeFraction: number, ...args: any[]): number
}

export interface TimingFunction2D extends Function {
  (timeFraction: number, ...args: any[]): number[]
}

export function reverse(timingFunction: TimingFunction): TimingFunction {
  return (timeFraction: number, ...args: any[]): number =>
    1 - timingFunction(1 - timeFraction, ...args)
}

export function reflect(timingFunction: TimingFunction): TimingFunction {
  return (timeFraction: number, ...args: any[]): number =>
    0.5 *
    (timeFraction < 0.5
      ? timingFunction(2 * timeFraction, ...args)
      : 2 - timingFunction(2 - 2 * timeFraction, ...args))
}

export const linear = (timeFraction: number): number => timeFraction

export { default as bezier2D } from './bezier'
export * from './bezier'
export * from './bounce'
export * from './circle'
export { default as ease } from './ease'
export * from './ease'
export * from './elastic'
export * from './expo'
