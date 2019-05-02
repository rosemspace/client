import { convertSStringToMs } from '@rosem/time-util'
import CSSTransitionDeclaration, {
  CSS_TRANSITION_DEFAULT_PROPERTY,
} from './CSSTransitionDeclaration'

export default function isTransitionMaxTimeout(
  { properties, delays, durations, timeout }: CSSTransitionDeclaration,
  property: string
): boolean {
  const propertyIndex: number =
    properties[0] !== CSS_TRANSITION_DEFAULT_PROPERTY
      ? properties.indexOf(property)
      : 0

  console.log(convertSStringToMs(delays[propertyIndex]) +
    convertSStringToMs(durations[propertyIndex]),
    timeout, property);
  return (
    convertSStringToMs(delays[propertyIndex]) +
      convertSStringToMs(durations[propertyIndex]) ===
    timeout
  )
}
