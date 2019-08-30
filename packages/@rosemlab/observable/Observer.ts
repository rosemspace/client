import { ObservablePropertyKey } from './ObservableObject'
import ObservableObject from './ObservableObject'

export default interface Observer extends Function {
  (
    newValue: any,
    oldValue: any,
    property: ObservablePropertyKey,
    target: ObservableObject
  ): any
}
