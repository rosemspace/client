import { inBrowser } from '@rosemlabs/env'

export default function supportsEventListenerOption(
  option: keyof AddEventListenerOptions
): boolean {
  let supportsOption: boolean = false

  if (inBrowser) {
    try {
      globalThis.addEventListener(
        option[0],
        null!,
        Object.defineProperty({}, option, {
          get() {
            supportsOption = true
          },
        })
      )
    } catch (e) {}
  }

  return supportsOption
}

export const supportsPassive = supportsEventListenerOption('passive')

export const supportsOnce = supportsEventListenerOption('once')
