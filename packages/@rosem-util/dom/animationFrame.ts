import global from '@rosem-util/env/global'

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
let requestAnimationFrame: (callback: FrameRequestCallback) => number
let cancelAnimationFrame: (handle: number) => void

if (null != global && typeof global.requestAnimationFrame === 'function') {
  // It's required to use a bounded function because IE sometimes throws
  // an "Invalid calling object" error if rAF is invoked without the global
  // object on the left hand side.
  requestAnimationFrame = global.requestAnimationFrame.bind(global)
  cancelAnimationFrame = global.cancelAnimationFrame.bind(global)
} else {
  requestAnimationFrame = (callback: Function) =>
    setTimeout(() => callback(Date.now()), 1000 / 60)
  cancelAnimationFrame = clearTimeout
}

export { requestAnimationFrame, cancelAnimationFrame }

// Any rAFs queued in a rAF will be executed in the next frame​.
export function onNextFrame(fn: any) {
  return requestAnimationFrame(function() {
    requestAnimationFrame(fn)
  })
}
