let requestAnimationFrame: Function = setTimeout
let cancelAnimationFrame: Function = clearTimeout

if (null != window && window.requestAnimationFrame) {
  // Any rAFs queued in event handlers will be executed in the ​same frame​.
  // Binding `requestAnimationFrame` like this fixes a bug in IE/Edge.
  requestAnimationFrame = window.requestAnimationFrame.bind(window)
  cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
}

export { requestAnimationFrame, cancelAnimationFrame }

// Any rAFs queued in a rAF will be executed in the next frame​.
export function nextFrame(fn: any) {
  return requestAnimationFrame(function() {
    requestAnimationFrame(fn)
  })
}
