import GenericPropertyDescriptor from './GenericPropertyDescriptor'
import ObserveFunction from './ObserveFunction'

export default interface ComputedPropertyDescriptor
  extends GenericPropertyDescriptor {
  value?: ObserveFunction
  get?: ObserveFunction
  set?: ObserveFunction
  noCache?: boolean
}
