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

export function resolveTarget(target, context = document) {
  return target instanceof Element
    ? context
      ? context.contains(target)
        ? target
        : context
      : target
    : target instanceof NodeList || target instanceof HTMLCollection
      ? resolveTarget(Array.from(target)[0])
      : target instanceof String || typeof target === 'string'
        ? context.querySelector(target)
        : Array.isArray(target)
          ? target[0]
          : target instanceof Function
            ? resolveTarget(target(context), context)
            : context
}

export function resolveTargets(targets, context = document) {
  return targets instanceof Element
    ? context
      ? context.contains(targets)
        ? [targets]
        : [context]
      : [targets]
    : targets instanceof String || typeof targets === 'string'
      ? context.querySelectorAll(targets)
      : Array.isArray(targets)
        ? targets
        : targets instanceof Function
          ? resolveTargets(targets(context), context)
          : Array.from(targets)
}

export function sStringToMsNumber(value) {
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
