import Renderer from '@rosem/virtual-dom/Renderer'

export default interface Hydrator<InputNode, OutputNode> {
  hydrate<
    ParentNode extends OutputNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: InputNode,
    manipulator: Renderer<
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
