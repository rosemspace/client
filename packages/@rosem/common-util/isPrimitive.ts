export default function isPrimitive(value: any): boolean {
  return Object(value) !== value
}
