import ManipulatorInterface from './ManipulatorInterface'

export default interface HydratorInterface<InputNode, OutputNode> {
  hydrate<
    ParentNode extends OutputNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends OutputNode,
    Comment extends OutputNode = OutputNode,
    CDATASection extends OutputNode = OutputNode
  >(
    inputNode: InputNode,
    manipulator: ManipulatorInterface<
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
