import Observer from './Observer'
import ObservableObject from './ObservableObject'

export default interface ObservablePropertyDescriptor<
  T extends ObservableObject = ObservableObject
> {
  configurable?: boolean
  enumerable?: boolean
  writable?: boolean
  get?(target: T): any
  set?: Observer<T>
  deep?: boolean
  value?: any
}
