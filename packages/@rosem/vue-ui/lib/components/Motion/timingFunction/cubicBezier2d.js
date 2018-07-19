import bezier2d from "./bezier2d";

// return bezier2d(f, [[0, 0], [p[0], p[1]], [p[2], p[3]], [1, 1]])

export default (timeFraction, points) =>
  bezier2d(timeFraction, [[0, 0], ...points, [1, 1]]);
