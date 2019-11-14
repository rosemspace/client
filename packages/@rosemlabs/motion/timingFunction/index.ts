export interface TimingFunction extends Function {
  (timeFraction: number, ...params: any[]): number
}

export interface TimingFunction2D extends Function {
  (timeFraction: number, ...params: any[]): number[]
}

export const linear = (timeFraction: number): number => timeFraction

export { default as bezier2D, quardBezier2D, cubicBezier2D } from './bezier'
export { bounceIn, bounceOut } from './bounce'
export { circleIn, circleOut, circleInOut } from './circle'
export { default as ease, easeIn2D, easeOut2D, easeInOut2D } from './ease'
export { easeInElastic, easeOutElastic } from './elastic'
export { default as easeOutExpo } from './easeOutExpo'
