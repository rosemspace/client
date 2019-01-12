import VNode, {
  PrimitiveVNode,
  VNodeChildElementList,
  VNodeChildren,
  VNodeProps,
} from './VNode'

export default interface VHostInterface<
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node
> {
  createElement(type: string): VNode<Node>

  createElement(
    type: string,
    propsOrChildren: VNodeProps | VNodeChildren<Node>
  ): VNode<Node>

  createElement(
    type: string,
    props: VNodeProps,
    children: VNodeChildren<Node>
  ): VNode<Node>

  createElement(
    type: string,
    propsOrChildren?: VNodeProps | VNodeChildren<Node>,
    children?: VNodeChildren<Node>
  ): VNode<Node>

  createVNode(
    type: string,
    props?: VNodeProps,
    children?: VNodeChildElementList<Node>,
    text?: PrimitiveVNode,
    realNode?: Element | Text | Comment | Node
  ): VNode<Node>

  elementToVNode(element: Element): VNode<Node>

  textToVNode(text: Text): VNode<Node>

  commentToVNode(comment: Comment): VNode<Node>

  toVNode(node: Node): VNode<Node>

  toNode(vnode: VNode<Node>): Node
}
