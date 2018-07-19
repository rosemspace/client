import easeInElastic from "./easeInElastic";

export default (timeFraction, params) =>
  1 - easeInElastic(1 - timeFraction, params);

// export default (timeFraction, { frequency = 3, offset = 0, decay = 6 } = {}) =>
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
