import { OBSERVABLE_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

export default function observeProperties(
  observableObject: ObservableObject,
  properties: Array<ObservablePropertyKey>,
  observer: Observer
): void {
  properties.forEach(function(property: ObservablePropertyKey): void {
    observableObject[OBSERVABLE_KEY].observeProperty(property, observer)
  })
}
