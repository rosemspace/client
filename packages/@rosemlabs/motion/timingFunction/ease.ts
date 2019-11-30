import { TimingFunction2D } from './index'
import { cubicBezier2D } from './bezier'

export const presets = {
  ease: [
    [0.25, 0.1],
    [0.25, 1.0],
  ],
  easeIn: [
    [0.42, 0.0],
    [1.0, 1.0],
  ],
  easeOut: [
    [0.0, 0.0],
    [0.58, 1.0],
  ],
  easeInOut: [
    [0.42, 0.0],
    [0.58, 1.0],
  ],
  easeOutIn: [
    [0.0, 0.42],
    [1.0, 0.58],
  ],
  test: [
    [0.42, 0.0],
    [0.34, -0.5],
    [0.98, 0.9],
    [-0.58, 1.0],
    [0.58, 1.0],
  ],
}

const ease2D: TimingFunction2D = (timeFraction) =>
  cubicBezier2D(timeFraction, presets.ease)

export default ease2D

export const easeIn2D: TimingFunction2D = (timeFraction: number) =>
  cubicBezier2D(timeFraction, presets.easeIn)

export const easeOut2D: TimingFunction2D = (timeFraction: number) =>
  cubicBezier2D(timeFraction, presets.easeOut)

export const easeInOut2D: TimingFunction2D = (timeFraction: number) =>
  cubicBezier2D(timeFraction, presets.easeInOut)

//// Old easeIn
// import quardBezier from './quardBezier'
//
// export default timeFraction => quardBezier(timeFraction, [0.42, 0])
