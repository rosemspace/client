import DefaultVHost from '@rosem/vdom/VHost'
import { DefaultVNodeProps } from '@rosem/vdom/VNode'
import { AttrMap } from '@rosem/vdom/module/Attribute'

export type ComposedVNodeProps =
  | {
      id?: string
      classList?: string
      attributes?: AttrMap
    }
  | DefaultVNodeProps

export default class VHost<
  VNodeProps extends ComposedVNodeProps = ComposedVNodeProps
> extends DefaultVHost<
  VNodeProps,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement
> {
  public setElementProperties(element: Element, { id, classList, attributes }: VNodeProps): void {
    id && element.setAttribute('id', id)
    classList && element.setAttribute('class', classList)

    for (let attributeName in attributes) {
      // noinspection JSUnfilteredForInLoop
      element.setAttribute(attributeName, attributes[attributeName])
    }
  }

  public getVNodeProperties(element: Element): VNodeProps {
    // todo remake to SimpleSet
    const attributes: AttrMap = {}
    const props = { attributes } as VNodeProps
    const elementAttributes = element.attributes

    for (let index = 0; index < elementAttributes.length; ++index) {
      const elementAttribute = elementAttributes[index]
      const name = elementAttribute.nodeName

      if ('id' !== name && 'class' !== name) {
        attributes[name] = elementAttribute.nodeValue as string
      } else {
        'id' === name
          ? props.id = elementAttribute.nodeValue
          : props.classList = elementAttribute.nodeValue
      }
    }

    return props
  }
}
