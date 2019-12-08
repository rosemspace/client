import DOMRenderer from './DOMRenderer'

export default interface DOMReconciler<ApplicableNode, ChangeableNode = ApplicableNode> {
  reconcile<
    DocumentFragment extends ChangeableNode,
    Element extends ChangeableNode,
    Text extends ChangeableNode,
    Comment extends ChangeableNode = ChangeableNode,
    CDATASection extends ChangeableNode = ChangeableNode
  >(
    changeableNode: ChangeableNode,
    applicableNode: ApplicableNode,
    renderer: DOMRenderer<
      ChangeableNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): ChangeableNode
}
