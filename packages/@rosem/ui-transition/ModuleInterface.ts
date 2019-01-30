export enum Phase {
  Cleanup,
  BeforeStart,
  Start,
  AfterEnd,
  Cancelled,
  length,
}

export type Detail = { [name: string]: any }

export type PhaseHook = (detail: Detail) => void

export default interface ModuleInterface extends Array<PhaseHook> {
  [Phase.Cleanup]: PhaseHook

  [Phase.BeforeStart]: PhaseHook

  [Phase.Start]: PhaseHook

  [Phase.AfterEnd]: PhaseHook

  [Phase.Cancelled]: PhaseHook

  getDetail?(): Detail
}
