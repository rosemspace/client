export default interface Serializer<InputNode> {
  serializeToString(inputNode: InputNode): string
}
