// return 1 - !~~timeFraction * 2**(-10 * timeFraction);

export default timeFraction =>
  1 - !~~timeFraction * Math.pow(2, -10 * timeFraction);
