const bezier = (timeFraction, points) =>
  points.length < 2
    ? points[0]
    : bezier(
        timeFraction,
        points.map(
          (point, index) => point + (points[index + 1] - point) * timeFraction
        )
      );

export default bezier;
