import VNode from './VNode'

export type PreHook = () => any

export type InitHook<VNodeProps, Node> = (vNode: VNode<VNodeProps, Node>) => any

export type CreateHook<VNodeProps, Node> = (
  emptyVNode: VNode<VNodeProps, Node>,
  vNode: VNode<VNodeProps, Node>
) => any

export type InsertHook<VNodeProps, Node> = (vNode: VNode<VNodeProps, Node>) => any

export type PrePatchHook<VNodeProps, Node> = (
  oldVNode: VNode<VNodeProps, Node>,
  vNode: VNode<VNodeProps, Node>
) => any

export type UpdateHook<VNodeProps, Node> = (
  oldVNode: VNode<VNodeProps, Node>,
  vNode: VNode<VNodeProps, Node>
) => any

export type PostPatchHook<VNodeProps, Node> = (
  oldVNode: VNode<VNodeProps, Node>,
  vNode: VNode<VNodeProps, Node>
) => any

export type DestroyHook<VNodeProps, Node> = (
  vNode: VNode<VNodeProps, Node>
) => any

export type RemoveHook<VNodeProps, Node> = (
  vNode: VNode<VNodeProps, Node>,
  removeCallback: () => void
) => any

export type PostHook = () => any

export default interface HookList<VNodeProps, Node> {
  pre?: PreHook // beforeCreate
  init?: InitHook<VNodeProps, Node> // created
  create?: CreateHook<VNodeProps, Node> // beforeMount
  insert?: InsertHook<VNodeProps, Node> // mounted
  prePatch?: PrePatchHook<VNodeProps, Node> // beforeUpdate
  update?: UpdateHook<VNodeProps, Node>
  postPatch?: PostPatchHook<VNodeProps, Node> // updated
  destroy?: DestroyHook<VNodeProps, Node> // beforeDestroy
  remove?: RemoveHook<VNodeProps, Node> // destroyed
  post?: PostHook
}
