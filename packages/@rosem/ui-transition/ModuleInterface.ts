export enum PhaseEnum {
  Cleanup = 'cleanup',
  BeforeStart = 'beforeStart',
  Start = 'start',
  AfterEnd = 'afterEnd',
  Cancelled = 'cancelled',
}

export type Phase =
  | PhaseEnum.Cleanup
  | PhaseEnum.BeforeStart
  | PhaseEnum.Start
  | PhaseEnum.AfterEnd
  | PhaseEnum.Cancelled

export type Detail = { [name: string]: any }

export type PhaseHook = (detail: Detail) => void

export default interface ModuleInterface {
  cleanup: PhaseHook
  beforeStart: PhaseHook
  start: PhaseHook
  afterEnd: PhaseHook
  cancelled: PhaseHook
  getDetail(): Detail
}
