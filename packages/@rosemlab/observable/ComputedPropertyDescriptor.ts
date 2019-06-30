import GenericPropertyDescriptor from './GenericPropertyDescriptor'
import Observer from './Observer'

export default interface ComputedPropertyDescriptor
  extends GenericPropertyDescriptor {
  value?: Observer
  get?: Observer
  set?: Observer
  noCache?: boolean
}
