import Observer from '@rosemlab/observable/Observer'
import ReactiveObject from './ReactiveObject'

export default interface ComputedPropertyDescriptor<
  T extends ReactiveObject = ReactiveObject
> {
  configurable?: boolean
  enumerable?: boolean
  get?: Observer<T>
  set?: Observer<T>
  noCache?: boolean
}
