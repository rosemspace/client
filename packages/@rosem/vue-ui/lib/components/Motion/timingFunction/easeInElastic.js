const PI2 = 2 * Math.PI;

export default (timeFraction, {amplitude = 1, frequency = 4, offset = -1, decay = 1} = {}) =>
    timeFraction === 0 || timeFraction === 1
        ? timeFraction
        : amplitude *
        Math.cos(frequency * (1 - offset * (1 - timeFraction)) * timeFraction * PI2) *
        timeFraction / Math.exp(decay * (1 - timeFraction));
