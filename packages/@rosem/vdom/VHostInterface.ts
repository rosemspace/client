import VNode, { VNodeChildren } from './VNode'

export default interface VHostInterface<
  VNodeProps,
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node
> {
  createVNode(
    type?: string,
    props?: VNodeProps,
    children?: Array<VNode<VNodeProps, Node> | string>,
    text?: string | number | null,
    realNode?: Element | Text | Comment | Node
  ): VNode<VNodeProps, Node>

  hyperScript(type: string): VNode<VNodeProps, Node>

  hyperScript(type: string, data: VNodeProps): VNode<VNodeProps, Node>

  hyperScript(
    type: string,
    children: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node>

  hyperScript(
    type: string,
    data: VNodeProps,
    children: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node>

  hyperScript(
    type: string,
    dataOrChildrenOrPrimitive?: VNodeProps | VNodeChildren<VNodeProps, Node>,
    childrenOrPrimitive?: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node>

  setElementProperties(element: Element, props: VNodeProps): void

  getVNodeProperties(element: Element): VNodeProps

  elementToVNode(element: Element): VNode<VNodeProps, Node>

  textToVNode(text: Text): VNode<VNodeProps, Node>

  commentToVNode(comment: Comment): VNode<VNodeProps, Node>

  toVNode(node: Node): VNode<VNodeProps, Node>
}
