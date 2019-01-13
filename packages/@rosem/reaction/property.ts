export const ALL_ABLE = {
  configurable: true,
  enumerable: true,
  writable: true,
}

export const NON_ENUMERABLE = {
  configurable: true,
  enumerable: false,
  writable: true,
}

export type PropertyDescriptorAblePart = {
  enumerable?: boolean
  configurable?: boolean
  writable?: boolean
}
