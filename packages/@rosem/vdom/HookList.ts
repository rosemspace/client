import VNode from './VNode'

export type PreHook = () => any

export type InitHook<Node> = (vNode: VNode<Node>) => any

export type CreateHook<Node> = (
  emptyVNode: VNode<Node>,
  vNode: VNode<Node>
) => any

export type InsertHook<Node> = (vNode: VNode<Node>) => any

export type PrePatchHook<Node> = (
  oldVNode: VNode<Node>,
  vNode: VNode<Node>
) => any

export type UpdateHook<Node> = (
  oldVNode: VNode<Node>,
  vNode: VNode<Node>
) => any

export type PostPatchHook<Node> = (
  oldVNode: VNode<Node>,
  vNode: VNode<Node>
) => any

export type DestroyHook<Node> = (vNode: VNode<Node>) => any

export type RemoveHook<Node> = (
  vNode: VNode<Node>,
  removeCallback: () => void
) => any

export type PostHook = () => any

export default interface HookList<Node> {
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
