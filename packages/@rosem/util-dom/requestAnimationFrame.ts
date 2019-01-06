// Any rAFs queued in event handlers will be executed in the ​same frame​.
const raf =
  (typeof window !== 'undefined' &&
    // Binding `requestAnimationFrame` like this fixes a bug in IE/Edge.
    window.requestAnimationFrame.bind(window)) ||
  setTimeout

export default raf

// Any rAFs queued in a rAF will be executed in the next frame​.
export function nextFrame(fn: any) {
  raf(function() {
    raf(fn)
  })
}
