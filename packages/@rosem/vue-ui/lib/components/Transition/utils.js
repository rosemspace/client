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
  return value !== null && typeof value !== 'undefined'
}

export function toMs(value) {
  return Number(value.slice(0, -1)) * 1000
}

export function getTimeout(delays, durations) {
  if (delays.length < durations.length) {
    // if one delay set for all transitions
    delays.fill(delays[0], 0, durations.length)
  }

  return Math.max.apply(
    null,
    durations.map(function(duration, index) {
      return toMs(duration) + toMs(delays[index])
    })
  )
}

export function getTransitionInfo(computedStyle) {
  let delays = computedStyle.transitionDelay.split(', ')
  let durations = computedStyle.transitionDuration.split(', ')

  return {
    endEvent: 'transitionend',
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
    toMs(info.delays[propertyIndex]) + toMs(info.durations[propertyIndex]) ===
    info.timeout
  )
}

export function getAnimationInfo(computedStyle) {
  let delays = computedStyle.animationDelay.split(', ')
  let durations = computedStyle.animationDuration.split(', ')

  return {
    endEvent: 'animationend',
    names: computedStyle.animationName.split(', '),
    delays,
    durations,
    timeout: getTimeout(delays, durations),
  }
}

export function isAnimationMaxTimeout(info, name) {
  let nameIndex = info.names.indexOf(name)

  return (
    toMs(info.delays[nameIndex]) + toMs(info.durations[nameIndex]) ===
    info.timeout
  )
}
