import {
  PreHook,
  CreateHook,
  UpdateHook,
  DestroyHook,
  RemoveHook,
  PostHook,
} from './HookList'

export interface Module<VNodeData, Node> {
  pre: PreHook
  create: CreateHook<VNodeData, Node>
  update: UpdateHook<VNodeData, Node>
  destroy: DestroyHook<VNodeData, Node>
  remove: RemoveHook<VNodeData, Node>
  post: PostHook
}
