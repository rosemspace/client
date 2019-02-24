import OperationListInterface from './OperationListInterface'
import VirtualInstance, {
  Primitive,
  VirtualChildList,
  VirtualElementProps,
  VirtualNodeType,
} from './VirtualInstance'

export default interface VirtualHostInterface {
  createVirtualInstance(typeOrName: VirtualNodeType | string): VirtualInstance

  createVirtualInstance(
    typeOrName: VirtualNodeType | string,
    propsOrChildListOrText:
      | Partial<VirtualElementProps>
      | VirtualChildList
      | Primitive
  ): VirtualInstance

  createVirtualInstance(
    typeOrName: VirtualNodeType | string,
    props: Partial<VirtualElementProps>,
    childListOrText: VirtualChildList | Primitive
  ): VirtualInstance

  createVirtualInstance(
    typeOrName: VirtualNodeType | string,
    propsOrChildListOrText?:
      | Partial<VirtualElementProps>
      | VirtualChildList
      | Primitive,
    childListOrText?: VirtualChildList | Primitive
  ): VirtualInstance

  renderVirtualInstance<
    Node,
    Element extends Node = Node,
    Text extends Node = Node,
    Comment extends Node = Node,
    CDATASection extends Node = Node
  >(
    virtualInstance: VirtualInstance,
    operationList: OperationListInterface<Node, Element, Text, Comment, CDATASection>
  ): Node

  // getDiff(oldNode: VNode, newNode: VNode): any // todo VNodeDiff

  // createVNode(
  //   type: string,
  //   props?: VNodeProps,
  //   children?: VNodeChildElementList<Node>,
  //   text?: PrimitiveVNode
  // ): VNode<Node>

  // nativeElementToVirtualNode<Element extends Node>(element: Element): VNode<Node>

  // virtualNodeToNativeElement<Element extends Node>(vnode: VNode<Node>): Element
}
