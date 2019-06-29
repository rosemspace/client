import DOMRenderer from './DOMRenderer'

export default interface DOMHydrator<InputNode, OutputNode> {
  hydrate<
    ParentNode extends OutputNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: InputNode,
    renderer: DOMRenderer<
      OutputNode,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): OutputNode
}
