import ManipulatorInterface from './ManipulatorInterface'
import VirtualInstance, {
  VirtualCDATASection,
  VirtualComment,
  VirtualDocumentFragment,
  VirtualElement,
  VirtualElementProps,
  VirtualNode,
  VirtualParentNode,
  VirtualText,
} from './VirtualInstance'

export default interface CommutatorInterface {
  mutateFromVirtualInstance<
    VirtualElementExtendedProps extends VirtualElementProps,
    Node,
    ParentNode extends Node,
    DocumentFragment extends ParentNode,
    Element extends ParentNode,
    Text extends Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    virtualInstance: VirtualInstance<VirtualElementExtendedProps>,
    manipulator: ManipulatorInterface<
      Node,
      ParentNode,
      DocumentFragment,
      Element,
      Text,
      Comment,
      CDATASection
    >
  ): ParentNode | Text | Comment | CDATASection

  mutateToVirtualInstance<
    VirtualElementExtendedProps extends VirtualElementProps,
    Node,
    DocumentFragment extends Node,
    Element extends Node,
    Text extends Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    instance: DocumentFragment | Element | Text | Comment | CDATASection,
    virtualManipulator: ManipulatorInterface<
      VirtualNode,
      VirtualParentNode,
      VirtualDocumentFragment,
      VirtualElement<VirtualElementExtendedProps>,
      VirtualText,
      VirtualComment,
      VirtualCDATASection
    >
  ): VirtualInstance
}
