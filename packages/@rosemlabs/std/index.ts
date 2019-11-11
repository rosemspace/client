import { Primitive } from 'type-fest'

export const defineProperties = Object.defineProperties

export const isArray = Array.isArray

// NaN is number :) Also it is the only value which does not equal itself
export const isNaN =
  Number.isNaN || ((value: any): value is typeof NaN => value !== value)

export const isNumber = (value: any): value is number =>
  !isNaN(value) && toString(value) === '[object Number]'

// !isPrimitive
export const isObject = (value: any): value is object => Object(value) === value

// (typeof value !== 'object' && typeof value !== 'function') ||
// value === null || value === void 0
export const isPrimitive = (value: any): value is Primitive =>
  Object(value) !== value

export const isString = (value: any): value is string =>
  toString(value) === '[object String]'

export const isUndefined = (value: any): value is undefined => value === void 0

export const regExp = (string: string, flags?: string): RegExp =>
  new RegExp(string, flags)

export const toFloat: (value: any) => number | typeof NaN =
  globalThis.parseFloat

export const toArray: <T, U>(
  iterable: Iterable<T> | ArrayLike<T>,
  mapTransformer?: (item: T, index: number) => U,
  thisArg?: any
) => U[] = Array.from

export const toString: (value: any) => string = Object.prototype.toString.call
