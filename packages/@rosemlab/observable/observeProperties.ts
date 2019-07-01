import { OBSERVABLE_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

export default function observeProperties(
  target: ObservableObject,
  properties: Array<ObservablePropertyKey>,
  observer: Observer
): void {
  properties.forEach(function(property: ObservablePropertyKey): void {
    target[OBSERVABLE_KEY].observeProperty(property, observer)
  })
}
