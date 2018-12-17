// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
export default function convertSStringToMs(value: string): number {
  return Number(value.slice(0, -1).replace(',', '.')) * 1000
}
