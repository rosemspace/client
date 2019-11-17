import { Primitive } from 'type-fest'

export * from './frame'
export { default as queueMicrotask } from './queueMicrotask'

export const defineProperties = Object.defineProperties

export const isArray = Array.isArray

// export const isArrayLike = (obj: any): obj is { length: number } => todo

// export const isCollection = (
//   obj: any
// ): obj is Iterable<any> | { length: number } => todo

export const isExisty = <T>(value: T): value is NonNullable<T> => null != value

/** Returns true and casts type if `x` appears to be an iterable */
export const isIterable = <T = unknown>(target: any): target is Iterable<T> =>
  Boolean(target) &&
  typeof Symbol !== 'undefined' &&
  typeof target[Symbol.iterator] === 'function'

// NaN is number :) Also it is the only value which does not equal itself
export const isNaN =
  Number.isNaN || ((value: any): value is typeof NaN => value !== value)

export const isNumber = (value: any): value is number =>
  !isNaN(value) && toString(value) === '[object Number]'

// !isPrimitive
export const isObject = (value: any): value is object => Object(value) === value

/** Casts if the `x` can be treated as an open object type */
export const isObjectLike = (target: any): target is any =>
  !!target && ('object' === typeof target || 'function' === typeof target)

// (typeof value !== 'object' && typeof value !== 'function') ||
// value === null || value === void 0
export const isPrimitive = (value: any): value is Primitive =>
  Object(value) !== value

/** Casts as a system promise if `x` is promise like. */
export const isPromiseLike = <T = unknown>(target: any): target is Promise<T> =>
  isObjectLike(target) && 'function' === typeof target.then

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
