export default function extractAttributes(el) {
  const attrs = {}
  let className, style

  if (el.hasAttributes()) {
    for (let i = 0; i < el.attributes.length; ++i) {
      // TODO improve
      const attr = el.attributes[i]
      if (attr.value) {
        attrs[attr.name] = attr.value === '' ? true : attr.value
      }
    }

    if (attrs.class) {
      className = attrs.class
      delete attrs.class
    }

    if (attrs.style) {
      style = attrs.style
      delete attrs.style
    }
  }

  return {
    attrs,
    class: className,
    style,
  }
}
