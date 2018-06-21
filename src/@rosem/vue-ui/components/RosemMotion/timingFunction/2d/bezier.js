const bezier = (timeFraction, points) =>
  points.length < 2
    ? points[0]
    : bezier(
        timeFraction,
        points.map((point, index) => [
          point[0] + (points[index + 1][0] - point[0]) * timeFraction,
          point[1] + (points[index + 1][1] - point[1]) * timeFraction
        ])
      );

export default bezier;
