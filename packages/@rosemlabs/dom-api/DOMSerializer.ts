export default interface DOMSerializer<InputNode> {
  serializeToString(inputNode: InputNode): string
}
