// import {VNodeProps} from '@rosemlabs/vdom/VNode'
// import {AttrMap} from '@rosemlabs/vdom/Attribute'
// import VNode from '@rosemlabs/vdom/VNode'
//
// class VirtualConverter {
//   public setElementProperties(
//     element: Element,
//     { id, classList, attributes }: VNodeProps
//   ): void {
//     // todo: remove HTMLElement
//     id && (element as HTMLElement & Element).setAttribute('id', id)
//     classList &&
//     (element as HTMLElement & Element).setAttribute('class', classList)
//
//     for (let attributeName in attributes) {
//       // noinspection JSUnfilteredForInLoop
//       (element as HTMLElement & Element).setAttribute(
//         attributeName,
//         String(attributes[attributeName])
//       ) // todo: check boolean
//     }
//   }
//
//   public getElementProperties(element: Element): VNodeProps {
//     // todo remake to SimpleSet
//     const attributes: AttrMap = {}
//     const props: VNodeProps = { attributes }
//     // todo: remove HTMLElement
//     const elementAttributes = (element as HTMLElement & Element).attributes
//
//     for (let index = 0; index < elementAttributes.length; ++index) {
//       const elementAttribute = elementAttributes[index]
//       const name = elementAttribute.nodeName
//
//       if ('id' !== name && 'class' !== name) {
//         attributes[name] = elementAttribute.nodeValue as string
//       } else {
//         'id' === name
//           ? (props.id = elementAttribute.nodeValue)
//           : (props.classList = elementAttribute.nodeValue)
//       }
//     }
//
//     return props
//   }
//
//   public elementToVNode(element: Element): VNode<Node> {
//     const children: Array<VNode<Node>> = []
//
//     for (let elementChildNode of this.host.getChildNodes(element)) {
//       children.push(this.toVNode(elementChildNode))
//     }
//
//     return this.createVNode(
//       this.host.getTagName(element).toLowerCase(),
//       this.getElementProperties(element),
//       children,
//       undefined,
//       element
//     )
//   }
//
//   public textToVNode(text: Text): VNode<Node> {
//     return this.createVNode(
//       undefined,
//       undefined,
//       undefined,
//       this.host.getTextContent(text),
//       text
//     )
//   }
//
//   public commentToVNode(comment: Comment): VNode<Node> {
//     return this.createVNode(
//       '!',
//       {},
//       [],
//       this.host.getTextContent(comment),
//       comment
//     )
//   }
//
//   public toVNode(node: Node): VNode<Node> {
//     switch (true) {
//       case this.host.isElement(node):
//         return this.elementToVNode(<Element>node)
//       case this.host.isText(node):
//         return this.textToVNode(<Text>node)
//       case this.host.isComment(node):
//         return this.commentToVNode(<Comment>node)
//       default:
//         return this.createVNode('', {}, [], undefined, node)
//     }
//   }
// }
