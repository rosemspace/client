import GenericPropertyDescriptor from './GenericPropertyDescriptor'
import ObservableObject from './ObservableObject'
import ObserveFunction from './ObserveFunction'

export default interface ObservablePropertyDescriptor
  extends GenericPropertyDescriptor {
  get?(observableObject: ObservableObject): any
  set?: ObserveFunction
  deep?: boolean
}
