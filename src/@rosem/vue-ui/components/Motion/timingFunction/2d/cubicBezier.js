import bezier from "./bezier";

// return bezier(f, [[0, 0], [p[0], p[1]], [p[2], p[3]], [1, 1]])

export default (timeFraction, points) =>
  bezier(timeFraction, [[0, 0], ...points, [1, 1]]);
