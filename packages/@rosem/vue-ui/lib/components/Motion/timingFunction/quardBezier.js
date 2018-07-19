export default (timeFraction, points) => [
  (1 - points[0]) * timeFraction,
  (1 - points[1]) * timeFraction
];
