import { ObservablePropertyKey } from './ObservableObject'
import ObservableObject from './ObservableObject'

export default interface Observer extends Function {
  (
    oldValue: any,
    newValue: any,
    property: ObservablePropertyKey,
    target: ObservableObject
  ): any
}
