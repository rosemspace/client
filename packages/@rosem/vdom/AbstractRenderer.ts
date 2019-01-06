import RendererInterface from './RendererInterface'
import VNode, { DefaultVNodeData } from './VNode'

let uuid = 0

export default abstract class AbstractRenderer<
  VNodeData extends DefaultVNodeData,
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node,
  NativeComponent extends Element = Element
>
  implements
    RendererInterface<
      VNodeData,
      Node,
      Comment,
      Text,
      Element,
      NativeComponent
    > {
  public createVNode(
    selector?: string,
    data?: VNodeData,
    children?: Array<VNode<VNodeData, Node> | string>,
    text?: string | null,
    realNode?: Element | Text | Comment | Node
  ): VNode<VNodeData, Node> {
    return {
      selector,
      data,
      children,
      text,
      realNode,
      key: null != data && null != data.key ? data.key : ++uuid,
    }
  }

  public abstract elementToVNode(element: Element): VNode<VNodeData, Node>

  public textToVNode(text: Text): VNode<VNodeData, Node> {
    return this.createVNode(
      undefined,
      undefined,
      undefined,
      this.getTextContent(text),
      text
    )
  }

  public commentToVNode(comment: Comment): VNode<VNodeData, Node> {
    return this.createVNode(
      '!',
      {} as VNodeData,
      [],
      this.getTextContent(comment),
      comment
    )
  }

  public nodeToVNode(node: Node): VNode<VNodeData, Node> {
    return this.createVNode('', {} as VNodeData, [], undefined, node)
  }

  public toVNode(node: Node): VNode<VNodeData, Node> {
    switch (true) {
      case this.isElement(node):
        return this.elementToVNode(node as Element)
      case this.isText(node):
        return this.textToVNode(node as Text)
      case this.isComment(node):
        return this.commentToVNode(node as Comment)
      default:
        return this.nodeToVNode(node)
    }
  }

  public abstract createElement(tagName: any): NativeComponent

  public abstract createElementNS(
    namespaceURI: string,
    qualifiedName: string
  ): Element

  public abstract createTextNode(text: string): Text

  public abstract createComment(text: string): Comment

  public abstract insertBefore(
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ): void

  public abstract removeChild(node: Node, child: Node): void

  public abstract appendChild(node: Node, child: Node): void

  public abstract parentNode(node: Node): Node | null

  public abstract nextSibling(node: Node): Node | null

  public abstract tagName(elm: Element): string

  public abstract setTextContent(node: Node, text: string | null): void

  public abstract getTextContent(node: Node): string | null

  public abstract isElement(node: Node): node is Element

  public abstract isText(node: Node): node is Text

  public abstract isComment(node: Node): node is Comment
}
