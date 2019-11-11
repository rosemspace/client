import DOMRenderer from './DOMRenderer'

export default interface DOMConverter<InputNode, OutputNode> {
  convert<
    DocumentFragment extends OutputNode,
    Element extends OutputNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: InputNode,
    renderer: DOMRenderer<
      OutputNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): OutputNode
}
