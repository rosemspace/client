import isNativeLoDash from 'lodash/isNative'
import { Primitive } from 'type-fest'

export * from './frame'
export { default as queueMicrotask } from './queueMicrotask'

// Reflection ------------------------------------------------------------------

export const defineProperties = Object.defineProperties

export const hasOwnProperty = Object.prototype.hasOwnProperty.call as <T>(
  target: T,
  property: PropertyKey
) => property is keyof T

// Conversion ------------------------------------------------------------------

export const toArray: <T, U>(
  iterable: Iterable<T> | ArrayLike<T>,
  mapTransformer?: (item: T, index: number) => U,
  thisArg?: unknown
) => U[] = Array.from

export const toInteger = globalThis.parseInt as (
  value: unknown,
  radix?: number
) => number | typeof NaN

export const toFloat = globalThis.parseFloat as (
  value: unknown
) => number | typeof NaN

export const toString: (value: unknown) => string =
  Object.prototype.toString.call

// Type checking ---------------------------------------------------------------

export const exists = <T>(value: T): value is NonNullable<T> => null != value

export const isArray: (value: unknown) => value is any[] = Array.isArray

export const isArrayLike = <T = unknown>(
  target: unknown
): target is ArrayLike<T> =>
  isArray(target) ||
  (isObject(target) &&
    hasOwnProperty(target, 'length') &&
    isInteger(target.length) &&
    (target.length === 0 || (target.length > 0 && target.length - 1 in target)))

export const isCollection = <T = unknown>(
  target: unknown
): target is Iterable<T> | { length: number } =>
  isIterable(target) || isArrayLike(target)

export const isFinite = globalThis.isFinite as (
  value: unknown
) => value is number

// fallback check is for IE
export const isFunction = (value: unknown): value is Function =>
  toString(value) === '[object Function]' || typeof value === 'function'

export const isInfinite = (value: number): value is typeof Infinity =>
  value === Infinity || value === -Infinity

export const isInteger = Number.isInteger as (value: unknown) => value is number

export const isIterable = <T = unknown>(target: any): target is Iterable<T> =>
  Boolean(target) &&
  typeof Symbol !== 'undefined' &&
  typeof target[Symbol.iterator] === 'function'

// NaN is number :) Also it is the only value which does not equal itself
export const isNaN =
  (Number.isNaN as (value: unknown) => value is typeof NaN) ||
  ((value: unknown): value is typeof NaN => value !== value)

export const isNative: (value: unknown) => boolean = isNativeLoDash

export const isNumber = (value: unknown): value is number =>
  !isNaN(value) && toString(value) === '[object Number]'

export const isObject = (
  target: unknown
): target is Record<any, any> & Object =>
  target !== null && toString(target) === '[object Object]'

// !isPrimitive
export const isObjectLike = (
  target: unknown
): target is (Record<any, any> & Object) | (Record<any, any> & Function) =>
  !isPrimitive(target)

// (typeof value !== 'object' && typeof value !== 'function') ||
// value === null || value === void 0
export const isPrimitive = (value: unknown): value is Primitive =>
  Object(value) !== value

export const isPromise = <T = unknown>(target: unknown): target is Promise<T> =>
  isObject(target) && isFunction(target.then) && isFunction(target.catch)

export const isPromiseLike = <T = unknown>(
  target: unknown
): target is PromiseLike<T> => isObjectLike(target) && isFunction(target.then)

export const isString = (value: unknown): value is string =>
  toString(value) === '[object String]'

export const isSymbol = (value: unknown): value is symbol =>
  toString(value) === '[object Symbol]'

export const isUndefined = (value: unknown): value is undefined =>
  value === void 0

// Additional ------------------------------------------------------------------

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: unknown, oldValue: unknown): boolean =>
  value !== oldValue && (!isNaN(value) || !isNaN(oldValue))

export const regExp = (string: string, flags?: string): RegExp =>
  new RegExp(string, flags)
