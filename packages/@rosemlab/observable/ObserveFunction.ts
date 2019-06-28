import { ObservablePropertyKey } from './ObservableObject'
import ObservableObject from './ObservableObject'

export default interface ObserveFunction extends Function {
  (
    oldValue: any,
    newValue: any,
    property: ObservablePropertyKey,
    observableObject: ObservableObject
  ): any
}
