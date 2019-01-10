import {
  PreHook,
  CreateHook,
  UpdateHook,
  DestroyHook,
  RemoveHook,
  PostHook,
} from './HookList'

export interface Module<VNodeProps, Node> {
  pre: PreHook
  create: CreateHook<VNodeProps, Node>
  update: UpdateHook<VNodeProps, Node>
  destroy: DestroyHook<VNodeProps, Node>
  remove: RemoveHook<VNodeProps, Node>
  post: PostHook
}
