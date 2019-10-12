import DOMRenderer from './DOMRenderer'

export default interface DOMReconciler<ApplicableNode, ChangeableNode = ApplicableNode> {
  reconcile<
    ParentNode extends ChangeableNode,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends ChangeableNode,
    Comment extends ChangeableNode = ChangeableNode,
    CDATASection extends ChangeableNode = ChangeableNode
  >(
    changeableNode: ChangeableNode,
    applicableNode: ApplicableNode,
    renderer: DOMRenderer<
      ChangeableNode,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): ChangeableNode
}
