import { ObservablePropertyKey } from './ObservableObject'
import ObservableObject from './ObservableObject'

export default interface Observer<
  T extends ObservableObject = ObservableObject
> extends Function {
  (
    this: T,
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey,
    target: T,
    ...others: any
  ): any
}
