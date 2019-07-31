export {
  default as supportsEventListenerOption,
  supportsPassive,
  supportsOnce,
} from './supportsEventListenerOption'
export { default as supportsPreload } from './supportsPreload'

const { getComputedStyle } = globalThis
const documentElement = globalThis.document.documentElement
const { display, height, overflowX, msOverflowStyle } = documentElement.style

documentElement.style.display = 'block'
documentElement.style.height = '100%'

const initialHeight = getStyleNumericValue(
  getComputedStyle(documentElement),
  'height'
)

documentElement.style.overflowX = 'scroll'
documentElement.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps

const scrollbarDefaultHeight =
  initialHeight -
  getStyleNumericValue(getComputedStyle(documentElement), 'height')

documentElement.style.display = display
documentElement.style.height = height
documentElement.style.overflowX = overflowX
documentElement.style.msOverflowStyle = msOverflowStyle

console.log(scrollbarDefaultHeight)

export function toFloat(value?: string | number | null): number {
  return (null != value ? parseFloat(String(value)) : 0) || 0
}

export function getStyleNumericValue(
  style: CSSStyleDeclaration,
  propertyName: string
) {
  return toFloat(style.getPropertyValue(propertyName))
}

export function getScrollbarWidth(el: HTMLElement) {
  return getComputedStyle(el, '-webkit-scrollbar') //scrollbarDefaultWidth
}
