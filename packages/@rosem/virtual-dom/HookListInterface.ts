import { VirtualNode as VNode } from './VirtualInstance'

export type PreHook = () => any

export type InitHook<Node> = (vNode: VNode) => any

export type CreateHook<Node> = (
  emptyVNode: VNode,
  vNode: VNode
) => any

export type InsertHook<Node> = (vNode: VNode) => any

export type PrePatchHook<Node> = (
  oldVNode: VNode,
  vNode: VNode
) => any

export type UpdateHook<Node> = (
  oldVNode: VNode,
  vNode: VNode
) => any

export type PostPatchHook<Node> = (
  oldVNode: VNode,
  vNode: VNode
) => any

export type DestroyHook<Node> = (vNode: VNode) => any

export type RemoveHook<Node> = (
  vNode: VNode,
  removeCallback: () => void
) => any

export type PostHook = () => any

export default interface HookListInterface<Node> {
  pre?: PreHook // beforeCreate
  init?: InitHook<Node> // created
  create?: CreateHook<Node> // beforeMount
  insert?: InsertHook<Node> // mounted
  prePatch?: PrePatchHook<Node> // beforeUpdate
  update?: UpdateHook<Node>
  postPatch?: PostPatchHook<Node> // updated
  destroy?: DestroyHook<Node> // beforeDestroy
  remove?: RemoveHook<Node> // destroyed
  post?: PostHook
}
