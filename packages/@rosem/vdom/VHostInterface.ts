import VNode, {
  PrimitiveVNode,
  // VNodeChildElementList,
  VNodeChildren,
  VNodeProps,
} from './VNode'

export default interface VHostInterface {
  createVirtualNode(type: string): VNode

  createVirtualNode(
    type: string,
    propsOrChildrenOrText: VNodeProps | VNodeChildren | VNode | PrimitiveVNode
  ): VNode

  createVirtualNode(
    type: string,
    props: VNodeProps,
    childrenOrText: VNodeChildren | VNode | PrimitiveVNode
  ): VNode

  createVirtualNode(
    type: string,
    propsOrChildrenOrText?: VNodeProps | VNodeChildren | VNode | PrimitiveVNode,
    childrenOrText?: VNodeChildren
  ): VNode

  // render(oldNode: VNode, newNode: VNode): any // todo render

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
