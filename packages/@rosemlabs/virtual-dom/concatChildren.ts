import { VirtualNode } from './index'

export default function concatChildren(
  parentNode: VirtualNode,
  children: VirtualNode[],
  tailChildren: VirtualNode[]
): VirtualNode[] {
  children[children.length - 1].nextSibling = tailChildren[0]

  let childNode

  for (childNode of tailChildren) {
    childNode.parent = parentNode
    children.push(childNode)
  }

  return children
}
