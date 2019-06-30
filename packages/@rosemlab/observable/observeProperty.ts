import { OBSERVABLE_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

export default function observeProperty(
  observableObject: ObservableObject,
  property: ObservablePropertyKey,
  observer: Observer
): void {
  observableObject[OBSERVABLE_KEY].observeProperty(property, observer)
}
