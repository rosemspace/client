import ReactivePropertyDescriptor from './ReactivePropertyDescriptor'

export default interface ReactiveComputedPropertyDescriptor
  extends ReactivePropertyDescriptor {
  value: Function
  lazy?: boolean
}
