import { getGlobalOf } from '@rosemlabs/env'

/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
export default function isDocumentElement(target: Element): boolean {
  return target === getGlobalOf(target).document.documentElement
}
