import { OBSERVER_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObserveFunction from './ObserveFunction'

export default function observeProperty(
  observableObject: ObservableObject,
  property: ObservablePropertyKey,
  observer: ObserveFunction
): void {
  observableObject[OBSERVER_KEY].observeProperty(property, observer)
}
