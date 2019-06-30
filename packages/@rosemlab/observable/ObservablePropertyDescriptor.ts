import GenericPropertyDescriptor from './GenericPropertyDescriptor'
import ObservableObject from './ObservableObject'
import Observer from './Observer'

export default interface ObservablePropertyDescriptor
  extends GenericPropertyDescriptor {
  get?(observableObject: ObservableObject): any
  set?: Observer
  deep?: boolean
}
