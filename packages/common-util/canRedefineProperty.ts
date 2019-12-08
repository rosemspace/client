const getOwnPropertyDescriptor: Function = Object.getOwnPropertyDescriptor

export default function canRedefineProperty(object: unknown, property: PropertyKey): boolean {
  const definedDescriptor: PropertyDescriptor | undefined = getOwnPropertyDescriptor(object, property)

  return null == definedDescriptor || true === definedDescriptor.configurable
}
