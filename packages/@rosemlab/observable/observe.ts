import ObservableObject, { ObservablePropertyKey } from './ObservableObject'
import Observer from './Observer'
import { OBSERVATION_KEY } from './index'

export default function observe(
  target: ObservableObject,
  observer: Observer
): void {
  target[OBSERVATION_KEY].observe(observer)
}

export function observeProperty(
  target: ObservableObject,
  property: ObservablePropertyKey,
  observer: Observer
): void {
  target[OBSERVATION_KEY].observeProperty(property, observer)
}

export function observeProperties(
  target: ObservableObject,
  properties: Array<ObservablePropertyKey>,
  observer: Observer
): void {
  properties.forEach(function(property: ObservablePropertyKey): void {
    target[OBSERVATION_KEY].observeProperty(property, observer)
  })
}
