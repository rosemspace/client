import VNode from './VNode'

export type PreHook = () => any

export type InitHook<VNodeData, Node> = (vNode: VNode<VNodeData, Node>) => any

export type CreateHook<VNodeData, Node> = (
  emptyVNode: VNode<VNodeData, Node>,
  vNode: VNode<VNodeData, Node>
) => any

export type InsertHook<VNodeData, Node> = (vNode: VNode<VNodeData, Node>) => any

export type PrePatchHook<VNodeData, Node> = (
  oldVNode: VNode<VNodeData, Node>,
  vNode: VNode<VNodeData, Node>
) => any

export type UpdateHook<VNodeData, Node> = (
  oldVNode: VNode<VNodeData, Node>,
  vNode: VNode<VNodeData, Node>
) => any

export type PostPatchHook<VNodeData, Node> = (
  oldVNode: VNode<VNodeData, Node>,
  vNode: VNode<VNodeData, Node>
) => any

export type DestroyHook<VNodeData, Node> = (
  vNode: VNode<VNodeData, Node>
) => any

export type RemoveHook<VNodeData, Node> = (
  vNode: VNode<VNodeData, Node>,
  removeCallback: () => void
) => any

export type PostHook = () => any

export default interface HookList<VNodeData, Node> {
  pre?: PreHook // beforeCreate
  init?: InitHook<VNodeData, Node> // created
  create?: CreateHook<VNodeData, Node> // beforeMount
  insert?: InsertHook<VNodeData, Node> // mounted
  prePatch?: PrePatchHook<VNodeData, Node> // beforeUpdate
  update?: UpdateHook<VNodeData, Node>
  postPatch?: PostPatchHook<VNodeData, Node> // updated
  destroy?: DestroyHook<VNodeData, Node> // beforeDestroy
  remove?: RemoveHook<VNodeData, Node> // destroyed
  post?: PostHook
}
