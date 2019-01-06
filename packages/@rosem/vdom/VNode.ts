export type Key = string | number

export type DefaultVNodeData = {
  key?: Key
  [key: string]: any
  [index: number]: any
}

export default interface VNode<VNodeData, Node> {
  children?: Array<VNode<VNodeData, Node> | string>
  data?: VNodeData
  key?: Key
  realNode?: Node
  selector?: string
  text?: string | number | null
}

// attributeStyleMap
interface VDOMStylePropertyMap {}

// classList
interface VDOMTokenList {}

// dataset
interface VDOMStringMap {}
