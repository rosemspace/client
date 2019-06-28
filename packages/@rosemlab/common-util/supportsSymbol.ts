import isNative from 'lodash/isNative'

export default null != Symbol &&
  isNative(Symbol) &&
  null != Reflect &&
  isNative(Reflect.ownKeys)
