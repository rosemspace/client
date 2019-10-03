import supportsSymbol from '@rosemlab/common-util/supportsSymbol'

export { default as ObservableObject } from './ObservableObject'

export const OBSERVATION_KEY: unique symbol = supportsSymbol
  ? Symbol('observable')
  : ('__ob__' as any)

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

const SSR_ATTRIBUTE = 'data-server-rendered'

const ASSET_TYPES = ['component', 'directive', 'filter']

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
]

const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]
