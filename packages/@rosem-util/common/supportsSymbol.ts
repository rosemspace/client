import { isNative } from 'lodash-es'

const supportsSymbol: boolean =
  null != Symbol &&
  isNative(Symbol) &&
  null != Reflect &&
  isNative(Reflect.ownKeys)

export default supportsSymbol
