import { OBSERVABLE_KEY } from './index'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'

export default function observeProperty(
  target: ObservableObject,
  property: ObservablePropertyKey,
  observer: Observer
): void {
  target[OBSERVABLE_KEY].observeProperty(property, observer)
}
