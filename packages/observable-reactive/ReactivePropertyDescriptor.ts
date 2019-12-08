import ObservablePropertyDescriptor from '@rosemlabs/observable/ObservablePropertyDescriptor'
import ReactiveObject from './ReactiveObject'

export default interface ReactivePropertyDescriptor<
  T extends ReactiveObject = ReactiveObject
> extends ObservablePropertyDescriptor<T> {
  primitiveConversion?: boolean
}
