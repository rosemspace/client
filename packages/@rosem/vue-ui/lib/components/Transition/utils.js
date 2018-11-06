// properties to auto check when set to `all`
export const AUTO_PROPERTIES_RECT = [
  'height',
  'width',
  'top',
  'left',
  'right',
  'bottom',
]

export const AUTO_PROPERTIES_STYLE = [
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'z-index',
]

export function isDefined(value) {
  return value != null
}

export function isString(value) {
  return toString.call(value) === '[object String]';
}

export function resolveTarget(target, context = document) {
  return target instanceof Element
    ? context
      ? context.contains(target)
        ? target
        : context
      : target
    : target instanceof NodeList || target instanceof HTMLCollection
      ? resolveTarget(Array.from(target)[0])
      : isString(target)
        ? context.querySelector(target)
        : Array.isArray(target)
          ? target[0]
          : target instanceof Function
            ? resolveTarget(target(context), context)
            : context
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
export function sStringToMsNumber(value) {
  return Number(value.slice(0, -1).replace(',', '.')) * 1000
}

export function getTimeout(delays, durations) {
  if (delays.length < durations.length) {
    // if one delay set for all transitions
    delays.fill(delays[0], 0, durations.length)
  }

  return Math.max.apply(
    null,
    durations.map(function(duration, index) {
      return sStringToMsNumber(duration) + sStringToMsNumber(delays[index])
    })
  )
}

export function getTransitionInfo(computedStyle) {
  let delays = computedStyle.transitionDelay.split(', ')
  let durations = computedStyle.transitionDuration.split(', ')

  return {
    endEventName: 'transitionend',
    properties: computedStyle.transitionProperty.split(', '),
    delays,
    durations,
    timeout: getTimeout(delays, durations),
  }
}

export function isTransitionMaxTimeout(info, property) {
  let propertyIndex =
    info.properties[0] !== 'all' ? info.properties.indexOf(property) : 0

  return (
    sStringToMsNumber(info.delays[propertyIndex]) +
      sStringToMsNumber(info.durations[propertyIndex]) ===
    info.timeout
  )
}

export function getAnimationInfo(computedStyle) {
  let delays = computedStyle.animationDelay.split(', ')
  let durations = computedStyle.animationDuration.split(', ')

  return {
    endEventName: 'animationend',
    names: computedStyle.animationName.split(', '),
    delays,
    durations,
    timeout: getTimeout(delays, durations),
  }
}

export function isAnimationMaxTimeout(info, name) {
  let nameIndex = info.names.indexOf(name)

  return (
    sStringToMsNumber(info.delays[nameIndex]) +
      sStringToMsNumber(info.durations[nameIndex]) ===
    info.timeout
  )
}

export function parseTransform(element) {
  //add sanity check
  return window
    .getComputedStyle(element)
    .transform.split(/[(,)]/)
    .slice(1, -1)
    .map(function(v) {
      return parseFloat(v)
    })
}

export function getBoundingClientRectWithoutTransform(element) {
  // add sanity checks and default values
  const { top, left, width, height } = element.getBoundingClientRect()
  const t = parseTransform(element)

  if (t.length === 6) {
    // 2D matrix
    // need some math to apply inverse of matrix
    // that is the matrix of the transformation of the element
    // a scale x
    // b shear y
    // c shear x
    // d scale y
    // tx translate x
    // tx translate y
    const det = t[0] * t[3] - t[1] * t[2]
    console.log(height, t[3])

    return {
      width: width / -t[0],
      height: height / -t[3],
      left: (left * t[3] - top * t[2] + t[2] * t[5] - t[4] * t[3]) / det,
      top: (-left * t[1] + top * t[0] + t[4] * t[1] - t[0] * t[5]) / det,
    }
  } else {
    // if (t.length > 6)
    // 3D matrix
    // haven't done the calculation to apply inverse of 4x4 matrix
    return { top, left, width, height }
  }
}
