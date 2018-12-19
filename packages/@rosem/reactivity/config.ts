const REACTIVE_OBJECT_KEY = '__react__'

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

export default {
  REACTIVE_OBJECT_KEY,
  SSR_ATTRIBUTE,
  ASSET_TYPES,
  LIFECYCLE_HOOKS,
}
