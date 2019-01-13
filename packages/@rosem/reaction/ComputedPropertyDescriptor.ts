import { PropertyDescriptorAblePart } from './property'
import ObserverFunction from './ObserverFunction'

export default interface ComputedPropertyDescriptor
  extends PropertyDescriptorAblePart {
  value?: ObserverFunction
  get?: ObserverFunction
  set?: ObserverFunction
  noCache?: boolean
}
