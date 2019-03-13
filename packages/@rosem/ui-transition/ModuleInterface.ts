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

export type DetailInit = {
  target?: Element
  [name: string]: any
}

export type Detail = {
  name: string,
  currentTarget: Element,
  target: Element,
  delegateTarget: Element,
  stageIndex: number,
  stageName: string,
  duration: number,
} & DetailInit

export type PhaseHook = (detail: Detail) => void

export default interface ModuleInterface {
  cleanup: PhaseHook
  beforeStart: PhaseHook
  start: PhaseHook
  afterEnd: PhaseHook
  cancelled: PhaseHook
  getDetail(): DetailInit
}
