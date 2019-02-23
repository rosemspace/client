import isNative from 'lodash-es/isNative'

const supportsSymbol: boolean =
  null != Symbol &&
  isNative(Symbol) &&
  null != Reflect &&
  isNative(Reflect.ownKeys)

export default supportsSymbol
