import HostInterface from './HostInterface'
import VNode, {
  DefaultVNodeProps,
  VNodeChildElement,
  VNodeChildren,
  VNodes,
} from './VNode'
import VHostInterface from './VHostInterface'
import isArray from '@rosem-util/common/isArray'
import isPrimitive from '@rosem-util/common/isPrimitive'
import isNumber from '@rosem-util/common/isNumber'
import isString from '@rosem-util/common/isString'

let uuid = 0

export default abstract class VHost<
  VNodeProps extends DefaultVNodeProps,
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node,
  NativeComponent extends Element = Element
> implements VHostInterface<VNodeProps, Node, Comment, Text, Element> {
  protected host: HostInterface<Node, Comment, Text, Element, NativeComponent>

  public constructor(
    document: HostInterface<Node, Comment, Text, Element, NativeComponent>
  ) {
    this.host = document
  }

  public createVNode(
    type?: string,
    props?: VNodeProps,
    children?: Array<VNode<VNodeProps, Node> | string | number>,
    text?: string | number | null,
    realNode?: Element | Text | Comment | Node
  ): VNode<VNodeProps, Node> {
    return {
      type,
      props,
      children,
      text,
      realNode,
      key: null != props && null != props.key ? props.key : ++uuid,
    }
  }

  protected addNamespace(
    namespace: string,
    data: VNodeProps,
    children?: VNodes<VNodeProps, Node>,
    type?: string
  ): void {
    data.namespace = namespace

    if (type !== 'foreignObject' && null != children) {
      for (let i = 0; i < children.length; ++i) {
        let childProps = children[i].props

        if (childProps !== undefined) {
          this.addNamespace(
            namespace,
            childProps,
            (children[i] as VNode<VNodeProps, Node>).children as VNodes<
              VNodeProps,
              Node
            >,
            children[i].type
          )
        }
      }
    }
  }

  public hyperScript(type: string): VNode<VNodeProps, Node>

  public hyperScript(
    type: string,
    data: VNodeProps
  ): VNode<VNodeProps, Node>

  public hyperScript(
    type: string,
    children: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node>

  public hyperScript(
    type: string,
    data: VNodeProps,
    children: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node>

  public hyperScript(
    type: string,
    propsOrChildrenOrPrimitive?: VNodeProps | VNodeChildren<VNodeProps, Node>,
    childrenOrPrimitive?: VNodeChildren<VNodeProps, Node>
  ): VNode<VNodeProps, Node> {
    let props: VNodeProps = {} as VNodeProps,
      children: VNodeChildren<VNodeProps, Node>,
      text: string | number | null | undefined,
      index: number

    if (childrenOrPrimitive !== undefined) {
      props = propsOrChildrenOrPrimitive as VNodeProps

      if (isArray(childrenOrPrimitive)) {
        children = childrenOrPrimitive
      } else if (isPrimitive(childrenOrPrimitive)) {
        text = childrenOrPrimitive as string | number | null | undefined
      } else if (
        childrenOrPrimitive &&
        (childrenOrPrimitive as VNode<VNodeProps, Node>).type
      ) {
        children = [childrenOrPrimitive]
      }
    } else if (propsOrChildrenOrPrimitive !== undefined) {
      if (isArray(propsOrChildrenOrPrimitive)) {
        children = propsOrChildrenOrPrimitive
      } else if (isPrimitive(propsOrChildrenOrPrimitive)) {
        text = propsOrChildrenOrPrimitive as string | number | null | undefined
      } else if (
        propsOrChildrenOrPrimitive &&
        (propsOrChildrenOrPrimitive as VNode<VNodeProps, Node>).type
      ) {
        children = [propsOrChildrenOrPrimitive]
      } else {
        props = propsOrChildrenOrPrimitive as VNodeProps
      }
    }

    if (children !== undefined) {
      for (
        index = 0;
        index < (children as Array<VNodeChildElement<VNodeProps, Node>>).length;
        ++index
      ) {
        if (
          isPrimitive(
            (children as Array<VNodeChildElement<VNodeProps, Node>>)[index]
          )
        )
          (children as Array<VNodeChildElement<VNodeProps, Node>>)[
            index
          ] = this.createVNode(
            undefined,
            undefined,
            undefined,
            (children as Array<string | number | null | undefined>)[index],
            undefined
          )
      }
    }

    if ('svg' === type) {
      this.addNamespace(
        'http://www.w3.org/2000/svg',
        props,
        children as Array<VNode<VNodeProps, Node>> | undefined,
        type
      )
    }

    return this.createVNode(
      type,
      props,
      children as Array<VNode<VNodeProps, Node> | string | number>,
      text,
      undefined
    )
  }

  public setElementProperties(element: Element, props: VNodeProps): void {
  }

  public getVNodeProperties(element: Element): VNodeProps {
    return {} as VNodeProps
  }

  public elementToVNode(element: Element): VNode<VNodeProps, Node> {
    const children: Array<VNode<VNodeProps, Node>> = []

    for (let elementChildNode of this.host.childNodes(element)) {
      children.push(this.toVNode(elementChildNode))
    }

    return this.createVNode(
      this.host.tagName(element).toLowerCase(),
      this.getVNodeProperties(element),
      children,
      undefined,
      element
    )
  }

  public textToVNode(text: Text): VNode<VNodeProps, Node> {
    return this.createVNode(
      undefined,
      undefined,
      undefined,
      this.host.getTextContent(text),
      text
    )
  }

  public commentToVNode(comment: Comment): VNode<VNodeProps, Node> {
    return this.createVNode(
      '!',
      {} as VNodeProps,
      [],
      this.host.getTextContent(comment),
      comment
    )
  }

  public toVNode(node: Node): VNode<VNodeProps, Node> {
    switch (true) {
      case this.host.isElement(node):
        return this.elementToVNode(node as Element)
      case this.host.isText(node):
        return this.textToVNode(node as Text)
      case this.host.isComment(node):
        return this.commentToVNode(node as Comment)
      default:
        return this.createVNode('', {} as VNodeProps, [], undefined, node)
    }
  }

  public toNode(vnode: VNode<VNodeProps, Node>): Node {
    if (isString(vnode) || isNumber(vnode)) {
      return this.host.createTextNode(String(vnode.text))
    }

    if (null != vnode.type) {
      if ('!' === vnode.type) {
        return this.host.createComment(null != vnode.text ? String(vnode.text) : '')
      }

      let element

      if (null != vnode.props) {
        element = null != vnode.props.namespace
          ? this.host.createElementNS(vnode.props.namespace, vnode.type as string)
          : this.host.createElement(vnode.type)

        this.setElementProperties(element, vnode.props)
      } else {
        element = this.host.createElement(vnode.type)
      }

      if (null != vnode.children) {
        for (let child of vnode.children) {
          if (null != child) {
            this.host.appendChild(element, this.toNode(child as VNode<VNodeProps, Node>))
          }
        }
      }

      return element
    }

    return this.host.createTextNode(null != vnode.text ? String(vnode.text) : '')
  }
}
