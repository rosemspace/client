// -> process.nextTick (microtask)
// -> Promise.resolve.then (microtask)
// -> process.nextTick (microtask)
// -> setTimeout(..., 0) (task)
// -> I/O
// -> setImmediate (task)

// Schedule a microtask
import Timeout = NodeJS.Timeout

export function scheduleMicrotask(callback: Function) {
  Promise.resolve().then(() => {
    callback()
  })
}

// Schedule animation frame callback
export function scheduleAnimationFrame(callback: Function) {
  requestAnimationFrame(() => {
    callback()
  })
}

export function scheduleTask(callback: Function): number {
  // Schedule a macrotask
  return globalThis.setTimeout(() => {
    callback()
  }, 0) as any
}
