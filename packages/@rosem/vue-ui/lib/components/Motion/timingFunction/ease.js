import { cubicBezier } from './bezier';

const presets = {
  ease: [[0.25, 0.1], [0.25, 1.0]],
  easeIn: [[0.42, 0.0], [1.0, 1.0]],
  easeOut: [[0.0, 0.0], [0.58, 1.0]],
  easeInOut: [[0.42, 0.0], [0.58, 1.0]],
  test: [[0.42, 0.0], [0.34, -.5], [0.98, 0.9], [-0.58, 1.0], [0.58, 1.0]],
};

export default timeFraction => cubicBezier(timeFraction, presets.ease);

export const easeIn = timeFraction => cubicBezier(timeFraction, presets.easeIn);

export const easeOut = timeFraction => cubicBezier(timeFraction, presets.easeOut);

export const easeInOut = timeFraction => cubicBezier(timeFraction, presets.easeInOut);

//// Old easeIn
// import quardBezier from "./quardBezier";
//
// export default timeFraction => quardBezier(timeFraction, [0.42, 0]);
