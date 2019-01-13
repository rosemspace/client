import { AttrMap } from './Attribute'

export type Key = string | number

export type PrimitiveVNode = string | number | boolean | null | undefined

export type VNodeProps = {
  attributes?: AttrMap
  key?: Key
  namespace?: string
} & Record<PropertyKey, any>

export default interface VNode<Node> {
  children?: Array<VNode<Node> | PrimitiveVNode>
  props?: VNodeProps
  key?: Key
  realNode?: Node
  text?: PrimitiveVNode
  type?: string
}

export type VNodeList<Node> = Array<VNode<Node>>

export type VNodeChildElement<Node> =
  | VNode<Node>
  | PrimitiveVNode

export type VNodeChildElementList<Node> = Array<
  VNodeChildElement<Node>
>

export type VNodeChildren<Node> =
  | VNodeChildElement<Node>
  | VNodeChildElementList<Node>

// attributeStyleMap
interface VDOMStylePropertyMap {}

// classList
interface VDOMTokenList {}

// dataset
interface VDOMStringMap {}
