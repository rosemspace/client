import isNative from 'lodash/isNative'

const supportsSymbol: boolean =
  null != Symbol &&
  isNative(Symbol) &&
  null != Reflect &&
  isNative(Reflect.ownKeys)

export default supportsSymbol
