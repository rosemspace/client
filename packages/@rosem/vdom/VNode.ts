type Primitive = string | number | boolean

export type PrimitiveVNode = Primitive | null | undefined

// type: 'name' - element - `text` not allowed
// type: null - text - `children` not allowed
// type: '!' - comment - `children` not allowed
export default interface VNode {
  type: string | null
  // key: VNodeKey
  props: VNodeProps
  children?: VNodeChildren
  text?: PrimitiveVNode
}

export type VNodeKey = Primitive

export type VNodeProps = {
  key: VNodeKey
  namespace?: string
  attrs?: VNodeAttrMap
} &  Record<string, Primitive>

export type VNodeAttrDescriptor = {
  namespace: string,
  value: Primitive,
}

export type VNodeAttrMap = Record<string, VNodeAttrDescriptor | Primitive>

export type VNodeList = Array<VNode>

export type VNodeChildElement = VNode | PrimitiveVNode

export type VNodeChildren = Array<VNodeChildElement>
