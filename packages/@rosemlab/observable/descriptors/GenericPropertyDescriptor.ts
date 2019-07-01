export const PERMISSIVE_DESCRIPTOR = {
  configurable: true,
  enumerable: true,
  writable: true,
}

export const NON_ENUMERABLE_DESCRIPTOR = {
  configurable: true,
  enumerable: false,
  writable: true,
}

export default interface GenericPropertyDescriptor {
  configurable?: boolean
  enumerable?: boolean
  writable?: boolean
  value?: any
  get?(...args: any): any
  set?(...args: any): any
}
