export const FPS: number = Math.floor(1_000 / 60)

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
let raf: (callback: FrameRequestCallback) => number
let caf: (handle: number) => void

if (
  null != globalThis &&
  typeof globalThis.requestAnimationFrame === 'function'
) {
  // It's required to use a bounded function because IE sometimes throws
  // an "Invalid calling object" error if rAF is invoked without the global
  // object on the left hand side.
  raf = globalThis.requestAnimationFrame.bind(globalThis)
  caf = globalThis.cancelAnimationFrame.bind(globalThis)
} else {
  const setTimeout = globalThis.setTimeout

  raf = (callback: FrameRequestCallback): number =>
    Number(
      setTimeout(() => {
        callback(Date.now())
      }, FPS)
    )
  caf = globalThis.clearTimeout
}

export { raf as requestAnimationFrame, caf as cancelAnimationFrame }

// Any rAFs queued in a rAF will be executed in the next frame.
export function requestNextAnimationFrame(
  fn: any,
  idCallback: (id: number) => void = (id) => id
) {
  return idCallback(
    raf(() => {
      idCallback(raf(fn))
    })
  )
}
