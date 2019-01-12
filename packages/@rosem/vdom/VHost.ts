import isArray from '@rosem-util/common/isArray'
import isPrimitive from '@rosem-util/common/isPrimitive'
import isNumber from '@rosem-util/common/isNumber'
import isString from '@rosem-util/common/isString'
import VNode, {
  PrimitiveVNode,
  VNodeChildElementList,
  VNodeChildren,
  VNodeList,
  VNodeProps,
} from './VNode'
import VHostInterface from './VHostInterface'
import HostInterface from './HostInterface'
import { AttrMap } from './Attribute'

let uuid = 0

export default class VHost<
  Node,
  Comment extends Node,
  Text extends Node,
  Element extends Node,
  NativeComponent extends Element = Element
> implements VHostInterface<Node, Comment, Text, Element> {
  protected host: HostInterface<Node, Comment, Text, Element, NativeComponent>

  public constructor(
    document: HostInterface<Node, Comment, Text, Element, NativeComponent>
  ) {
    this.host = document
  }

  public createVNode(
    type?: string,
    props?: VNodeProps,
    children?: VNodeChildElementList<Node>,
    text?: PrimitiveVNode,
    realNode?: Element | Text | Comment | Node
  ): VNode<Node> {
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
    children?: VNodeList<Node>,
    type?: string
  ): void {
    data.namespace = namespace

    if ('foreignObject' !== type && null != children) {
      for (let i = 0; i < children.length; ++i) {
        let childProps = children[i].props

        if (null != childProps) {
          this.addNamespace(
            namespace,
            childProps,
            <VNodeList<Node>>children[i].children,
            children[i].type
          )
        }
      }
    }
  }

  public createElement(
    type: string,
    propsOrChildren?: VNodeProps | VNodeChildren<Node>,
    children?: VNodeChildren<Node>
  ): VNode<Node> {
    let props: VNodeProps = {}
    let text: PrimitiveVNode
    let index: number

    if (null != children) {
      props = <VNodeProps>propsOrChildren

      if (isArray(<VNodeChildElementList<Node>>children)) {
        children = <VNodeChildElementList<Node>>children
      } else if (isPrimitive(<PrimitiveVNode>children)) {
        text = <PrimitiveVNode>children
      } else if ((<VNode<Node>>children).type) {
        children = [<VNode<Node>>children]
      }
    } else if (null != propsOrChildren) {
      if (isArray(<VNodeChildElementList<Node>>propsOrChildren)) {
        children = <VNodeChildElementList<Node>>propsOrChildren
      } else if (isPrimitive(propsOrChildren)) {
        text = <PrimitiveVNode>propsOrChildren
      } else if ((<VNode<Node>>propsOrChildren).type) {
        children = [<VNode<Node>>propsOrChildren]
      } else {
        props = <VNodeProps>propsOrChildren
      }
    }

    if (null != children) {
      for (
        index = 0;
        index < (<VNodeChildElementList<Node>>children).length;
        ++index
      ) {
        if (isPrimitive((<VNodeChildElementList<Node>>children)[index]))
          (<VNodeChildElementList<Node>>children)[index] = this.createVNode(
            undefined,
            undefined,
            undefined,
            (<VNodeChildElementList<Node>>children)[index] as PrimitiveVNode,
            undefined
          )
      }
    }

    if ('svg' === type) {
      this.addNamespace(
        'http://www.w3.org/2000/svg',
        props,
        <VNodeList<Node>>children,
        type
      )
    }

    return this.createVNode(
      type,
      props,
      <VNodeChildElementList<Node>>children,
      text,
      undefined
    )
  }

  public setElementProperties(
    element: Element,
    { id, classList, attributes }: VNodeProps
  ): void {
    // todo: remove HTMLElement
    id && (element as HTMLElement & Element).setAttribute('id', id)
    classList && (element as HTMLElement & Element).setAttribute('class', classList)

    for (let attributeName in attributes) {
      // noinspection JSUnfilteredForInLoop
      (element as HTMLElement & Element).setAttribute(attributeName, String(attributes[attributeName])) // todo: check boolean
    }
  }

  public getElementProperties(element: Element): VNodeProps {
    // todo remake to SimpleSet
    const attributes: AttrMap = {}
    const props: VNodeProps = { attributes }
    // todo: remove HTMLElement
    const elementAttributes = (element as HTMLElement & Element).attributes

    for (let index = 0; index < elementAttributes.length; ++index) {
      const elementAttribute = elementAttributes[index]
      const name = elementAttribute.nodeName

      if ('id' !== name && 'class' !== name) {
        attributes[name] = elementAttribute.nodeValue as string
      } else {
        'id' === name
          ? (props.id = elementAttribute.nodeValue)
          : (props.classList = elementAttribute.nodeValue)
      }
    }

    return props
  }

  public elementToVNode(element: Element): VNode<Node> {
    const children: Array<VNode<Node>> = []

    for (let elementChildNode of this.host.getChildNodes(element)) {
      children.push(this.toVNode(elementChildNode))
    }

    return this.createVNode(
      this.host.getTagName(element).toLowerCase(),
      this.getElementProperties(element),
      children,
      undefined,
      element
    )
  }

  public textToVNode(text: Text): VNode<Node> {
    return this.createVNode(
      undefined,
      undefined,
      undefined,
      this.host.getTextContent(text),
      text
    )
  }

  public commentToVNode(comment: Comment): VNode<Node> {
    return this.createVNode(
      '!',
      {},
      [],
      this.host.getTextContent(comment),
      comment
    )
  }

  public toVNode(node: Node): VNode<Node> {
    switch (true) {
      case this.host.isElement(node):
        return this.elementToVNode(<Element>node)
      case this.host.isText(node):
        return this.textToVNode(<Text>node)
      case this.host.isComment(node):
        return this.commentToVNode(<Comment>node)
      default:
        return this.createVNode('', {}, [], undefined, node)
    }
  }

  public toNode(vnode: VNode<Node>): Node {
    if (isString(vnode) || isNumber(vnode)) {
      return this.host.createTextNode(String(vnode.text))
    }

    if (null != vnode.type) {
      if ('!' === vnode.type) {
        return this.host.createComment(
          null != vnode.text ? String(vnode.text) : ''
        )
      }

      let element

      if (null != vnode.props) {
        element =
          null != vnode.props.namespace
            ? this.host.createElementNS(vnode.props.namespace, vnode.type)
            : this.host.createElement(vnode.type)

        this.setElementProperties(element, vnode.props)
      } else {
        element = this.host.createElement(vnode.type)
      }

      if (null != vnode.children) {
        for (let child of vnode.children) {
          if (null != child) {
            this.host.appendChild(element, this.toNode(<VNode<Node>>child))
          }
        }
      }

      return element
    }

    return this.host.createTextNode(
      null != vnode.text ? String(vnode.text) : ''
    )
  }
}
