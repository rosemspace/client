import global from '@rosem-util/env/global'

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
let raf: (callback: FrameRequestCallback) => number
let caf: (handle: number) => void

if (null != global && typeof global.requestAnimationFrame === 'function') {
  // It's required to use a bounded function because IE sometimes throws
  // an "Invalid calling object" error if rAF is invoked without the global
  // object on the left hand side.
  raf = global.requestAnimationFrame.bind(global)
  caf = global.cancelAnimationFrame.bind(global)
} else {
  raf = (callback: Function) =>
    setTimeout(() => callback(Date.now()), 1_000 / 60)
  caf = clearTimeout
}

export { raf as requestAnimationFrame, caf as cancelAnimationFrame }

// Any rAFs queued in a rAF will be executed in the next frame​.
export function nextFrame(fn: any) {
  return requestAnimationFrame(function() {
    requestAnimationFrame(fn)
  })
}
