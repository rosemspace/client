export type Key = string | number

export type DefaultVNodeProps = {
  key?: Key
  namespace?: string
  [key: string]: any
  [index: number]: any
}

export type VNodes<VNodeProps, Node> = Array<VNode<VNodeProps, Node>>

export type VNodeChildElement<VNodeProps, Node> =
  | VNode<VNodeProps, Node>
  | string
  | number
  | null
  | undefined

type ArrayOrElement<T> = T | T[];

export type VNodeChildren<VNodeData, Node> = ArrayOrElement<
  VNodeChildElement<VNodeData, Node>
>

export default interface VNode<VNodeProps, Node> {
  children?: Array<VNode<VNodeProps, Node> | string | number>
  props?: VNodeProps
  key?: Key
  realNode?: Node
  text?: string | number | null
  type?: string
}

// attributeStyleMap
interface VDOMStylePropertyMap {}

// classList
interface VDOMTokenList {}

// dataset
interface VDOMStringMap {}
