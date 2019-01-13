import { PropertyDescriptorAblePart } from './property'
import ObservableObject from './ObservableObject'
import ObserverFunction from './ObserverFunction'

export default interface ObservablePropertyDescriptor
  extends PropertyDescriptorAblePart {
  value?: any
  get?(observableObject: ObservableObject): any
  set?: ObserverFunction
  deep?: boolean
}
