export default (timeFraction, { frequency = 3, offset = 0, decay = 6 } = {}) =>
  timeFraction === 0 || timeFraction === 1
    ? timeFraction
    : Math.cos(
        frequency *
          (1 - offset * (1 - timeFraction)) *
          timeFraction *
          2 *
          Math.PI
      ) *
      timeFraction /
      Math.exp(decay * (1 - timeFraction));
