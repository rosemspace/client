export default function setStyle(
  element: HTMLElement | SVGElement | Element,
  attribute: string,
  value: string | number | boolean | null
): void {
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.style.setProperty(attribute, null != value ? String(value) : null)
  } else {
    const style: string | null = element.getAttribute('style')

    element.setAttribute(
      'style',
      style
        ? style.replace(
            new RegExp(`(${attribute}:)\\s*[^;]+;?`),
            null != value ? `$1${String(value)};` : ''
          )
        : `${attribute}:${value};`
    )
  }
}
