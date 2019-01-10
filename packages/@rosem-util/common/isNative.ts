export default function isNative(ctor: any): boolean {
  return typeof ctor === 'function' && /native code/.test(ctor.toString())
}
