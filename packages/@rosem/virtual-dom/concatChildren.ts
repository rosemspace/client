import { VirtualNodeList, VirtualParentNode } from './VirtualInstance'

export default function concatChildren(
  parentNode: VirtualParentNode,
  children: VirtualNodeList,
  tailChildren: VirtualNodeList
): VirtualNodeList {
  children[children.length - 1].nextSibling = tailChildren[0]

  let childNode

  for (childNode of tailChildren) {
    childNode.parent = parentNode
    children.push(childNode)
  }

  return children
}
