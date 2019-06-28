import { OBSERVER_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import ObserveFunction from './ObserveFunction'

export default function observeProperties(
  observableObject: ObservableObject,
  properties: Array<ObservablePropertyKey>,
  observer: ObserveFunction
): void {
  properties.forEach(function(property: ObservablePropertyKey): void {
    observableObject[OBSERVER_KEY].observeProperty(property, observer)
  })
}
