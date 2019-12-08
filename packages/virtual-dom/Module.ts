import {
  PreHook,
  CreateHook,
  UpdateHook,
  DestroyHook,
  RemoveHook,
  PostHook,
} from './HookListInterface'

export interface Module<Node> {
  pre: PreHook
  create: CreateHook<Node>
  update: UpdateHook<Node>
  destroy: DestroyHook<Node>
  remove: RemoveHook<Node>
  post: PostHook
}
