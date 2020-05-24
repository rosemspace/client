const nativeCode = (name: string): string =>
  `function ${name}() { [native code] }`

let promise: Promise<void>

const createQueueMicrotaskViaPromises: () => (
  microtask: VoidFunction
) => void = (): ((microtask: VoidFunction) => void) => {
  return (microtask: VoidFunction): void => {
    ;(promise || (promise = Promise.resolve()))
      .then(() => microtask())
      .catch((err) =>
        // With setTimeout, the error will invoke window.onerror (like
        // queueMicrotask). Without setTimeout, it won't
        setTimeout(() => {
          throw err
        }, 0)
      )
  }
}

const createQueueMicrotaskViaMutationObserver: () => (
  microtask: VoidFunction
) => void = (): ((microtask: VoidFunction) => void) => {
  let i = 0
  let microtaskQueue: VoidFunction[] = []
  const observer: MutationObserver = new MutationObserver((): void => {
    microtaskQueue.forEach((microtask) => microtask())
    microtaskQueue = []
  })
  const node = document.createTextNode('')

  observer.observe(node, { characterData: true })

  return (microtask: VoidFunction): void => {
    microtaskQueue.push(microtask)

    // Trigger a mutation observer callback, which is a microtask.
    node.data = String(++i % 2)
  }
}

/**
 * Queues a function to be run in the next microtask. If the browser supports
 * Promises, those are used. Otherwise it falls back to MutationObserver.
 * Note: since Promise polyfills are popular but not all support microtasks,
 * we check for native implementation rather than a polyfill.
 */
const qm: (microtask: VoidFunction) => void =
  typeof globalThis.queueMicrotask === 'function' &&
  globalThis.queueMicrotask.toString() === nativeCode('queueMicrotask')
    ? globalThis.queueMicrotask.bind(globalThis)
    : typeof Promise === 'function' &&
      Promise.toString() === nativeCode('Promise')
    ? createQueueMicrotaskViaPromises()
    : createQueueMicrotaskViaMutationObserver()

export default qm.bind(globalThis)
