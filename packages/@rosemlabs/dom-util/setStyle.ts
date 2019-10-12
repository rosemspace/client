import isNumber from 'lodash/isNumber'

function normalizeValue(value: string | number | boolean): string {
  return isNumber(value) ? String(value) + 'px' : String(value)
}

export default function setStyle(
  element: HTMLElement | SVGElement | Element,
  attribute: string,
  value: string | number | boolean | null
): void {
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.style.setProperty(
      attribute,
      null != value ? normalizeValue(value) : null
    )
  } else {
    const style: string | null = element.getAttribute('style')

    element.setAttribute(
      'style',
      style
        ? style.replace(
            new RegExp(`(${attribute}:)\\s*[^;]+;?`),
            null != value ? `$1${normalizeValue(value)};` : ''
          )
        : null != value
        ? `${attribute}:${normalizeValue(value)};`
        : ''
    )
  }
}
