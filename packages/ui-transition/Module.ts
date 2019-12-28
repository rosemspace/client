import StageDispatcher, { StageDispatcherDetail } from './StageDispatcher'

export enum PhaseEnum {
  BeforeStageChange = 'beforeStageChange',
  BeforeStart = 'beforeStart',
  Start = 'start',
  AfterEnd = 'afterEnd',
  Cancelled = 'cancelled',
}

export type Phase =
  | PhaseEnum.BeforeStageChange
  | PhaseEnum.BeforeStart
  | PhaseEnum.Start
  | PhaseEnum.AfterEnd
  | PhaseEnum.Cancelled

export type PhaseHook<
  T extends StageDispatcherDetail = StageDispatcherDetail
> = (stageDispatcher: StageDispatcher<T>, next: () => void) => void

export default interface Module<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  U extends Record<string, unknown> = any,
  T extends StageDispatcherDetail = StageDispatcherDetail
> {
  beforeStageChange?: PhaseHook<U & T>
  beforeStart?: PhaseHook<U & T>
  start?: PhaseHook<U & T>
  afterEnd?: PhaseHook<U & T>
  cancelled?: PhaseHook<U & T>
  getDetail(): U
}
