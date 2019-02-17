import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isPrimitive from '@rosem-util/common/isPrimitive'
import VNode, {
  PrimitiveVNode,
  VNodeAttrDescriptor,
  VNodeChildren,
  VNodeProps,
} from './VNode'
import VHostInterface from './VHostInterface'
import HostInterface from './HostInterface'

let uuid = 0

export default class VHost implements VHostInterface {
  // todo: move to parser
  // protected addNamespace(
  //   type: string | null,
  //   namespace: string,
  //   props: VNodeProps,
  //   children?: VNodeList
  // ): void {
  //   props.namespace = namespace
  //
  //   if (type && null != children) {
  //     // const namespace
  //   }
  //
  //   if (
  //     this.namespaces[type].exclude &&
  //     !this.namespaces[type].exclude.test(type)
  //   ) {
  //     for (let i = 0; i < children.length; ++i) {
  //       let childProps = children[i].props
  //
  //       if (null != childProps) {
  //         this.addNamespace(children[i].type, namespace, childProps, <
  //           VNodeList
  //         >children[i].children)
  //       }
  //     }
  //   }
  // }

  public createVirtualNode(
    type: string,
    propsOrChildrenOrText?: VNodeProps | VNodeChildren | VNode | PrimitiveVNode,
    childrenOrText?: VNodeChildren
  ): VNode {
    let props: VNodeProps = {
      key: ++uuid,
    }
    let text: PrimitiveVNode
    let index: number

    if (null != childrenOrText) {
      props = <VNodeProps>propsOrChildrenOrText

      if (isArray(childrenOrText)) {
        childrenOrText = <VNodeChildren>childrenOrText
      } else if (isPrimitive(childrenOrText)) {
        text = <PrimitiveVNode>childrenOrText
      } else if ((<VNode>childrenOrText).type) {
        childrenOrText = [<VNode>childrenOrText]
      }
    } else if (null != propsOrChildrenOrText) {
      if (isArray(<VNodeChildren>propsOrChildrenOrText)) {
        childrenOrText = <VNodeChildren>propsOrChildrenOrText
      } else if (isPrimitive(propsOrChildrenOrText)) {
        text = <PrimitiveVNode>propsOrChildrenOrText
      } else if ((<VNode>propsOrChildrenOrText).type) {
        childrenOrText = [<VNode>propsOrChildrenOrText]
      } else {
        props = <VNodeProps>propsOrChildrenOrText
      }
    }

    if (null != childrenOrText) {
      for (index = 0; index < (<VNodeChildren>childrenOrText).length; ++index) {
        if (isPrimitive((<VNodeChildren>childrenOrText)[index]))
          (<VNodeChildren>childrenOrText)[index] = {
            type: null,
            props,
            children: undefined,
            text: <PrimitiveVNode>(<VNodeChildren>childrenOrText)[index],
          }
      }
    }

    // todo: move to parser
    // if (this.namespaces[type]) {
    //   this.addNamespace(type, this.namespaces[type].namespace, props, <
    //     VNodeList
    //   >childrenOrText)
    // }

    return { type, props, children: <VNodeChildren>childrenOrText, text }
  }

  public toRealNode<
    RealNode,
    RealElement extends RealNode,
    RealText extends RealNode,
    RealComment extends RealNode
  >(
    host: HostInterface<RealNode, RealElement, RealText, RealComment>,
    vnode: VNode
  ): RealNode {
    if (isString(vnode) || isNumber(vnode)) {
      return host.createText(String(vnode.text))
    }

    if (null != vnode.type) {
      if ('!' === vnode.type) {
        return host.createComment(
          null != vnode.text ? String(vnode.text) : ''
        )
      }

      const props: VNodeProps = vnode.props
      const element: RealElement = props.namespace
        ? host.createElementNS(props.namespace, vnode.type)
        : host.createElement(vnode.type)

      if (props.attrs) {
        forEach(
          props.attrs,
          (
            attr: VNodeAttrDescriptor | string | number | boolean,
            key: string
          ) => {
            isPrimitive(attr)
              ? host.setAttribute(element, key, attr)
              : host.setAttributeNS(
                  element,
                  (<VNodeAttrDescriptor>attr).namespace,
                  key,
                  (<VNodeAttrDescriptor>attr).value
                )
          }
        )
      }

      if (vnode.children) {
        for (const child of vnode.children) {
          if (null != child) {
            host.appendChild(element, this.toRealNode(host, <VNode>child))
          }
        }
      }

      return element
    }

    return host.createText(null != vnode.text ? String(vnode.text) : '')
  }
}
