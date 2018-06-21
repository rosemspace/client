// const PI2 = 2 * Math.PI;

// export default (timeFraction, {amplitude = 1, frequency = 4, offset = -1, decay = 1} = {}) =>
//     timeFraction === 0 || timeFraction === 1
//         ? timeFraction
//         : amplitude *
//         Math.cos(frequency * (1 - offset * (1 - timeFraction)) * timeFraction * PI2) *
//         timeFraction / Math.exp(decay * (1 - timeFraction));

// export default (timeFraction, {amplitude = 1, frequency = 1.5, offset = -1, decay = 1} = {}) => {
//     const times = 2;
//
//     return timeFraction <= 1/3
//         ? timeFraction * timeFraction * 3*3
//         : timeFraction <= 2/3
//         ? (timeFraction-2/3) * (timeFraction-2/3) * 3*3
//         : (timeFraction-2/3) * (timeFraction-2/3) * 3*3;
// }

var gravitySpeed = 0;
// var prevGravitySpeed = 0;
var gravity = 0.00226;
var speedY = 0;
var y = 0;
// var bounce = 1;

export default (
  timeFraction
  // { amplitude = 1, frequency = 1.5, offset = -1, decay = 1 } = {}
) => {
  gravitySpeed += gravity;
  y += speedY + gravitySpeed;

  // if (y > 1) {
  //     y = 1;
  //     gravitySpeed = -gravitySpeed * bounce;
  // }
  //
  // if (y >= 1) {
  //     console.log(timeFraction);
  // }
  //
  // if (prevGravitySpeed < 0 && gravitySpeed >= 0) {
  //     console.log(timeFraction);
  // }
  //
  // prevGravitySpeed = gravitySpeed;

  y = 8 * timeFraction * timeFraction / 2;

  if (y > 1) {
    y = 1 - 0.5 + 2 * 8 * (0.75 - timeFraction) * (0.75 - timeFraction) / 2;
  }

  // speed = distance = 1 / time = 1000ms
  // distance = speed * time
  // S = (a * t^2) / 2
  // a = 2 * S / t^2

  return y;
};
