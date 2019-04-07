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
  target?: HTMLElement | SVGSVGElement
  [name: string]: any
}

export type Detail = {
  name: string,
  currentTarget: HTMLElement | SVGSVGElement,
  target: HTMLElement | SVGSVGElement,
  delegateTarget: HTMLElement | SVGSVGElement,
  stageIndex: number,
  stageName: string,
  duration: number,
  done?: () => Detail
  computedStyle: CSSStyleDeclaration,
  defferFrame: () => void
} & Record<string, any>

export type PhaseHook = (detail: Detail) => void

export default interface Module {
  cleanup: PhaseHook
  beforeStart: PhaseHook
  start: PhaseHook
  afterEnd: PhaseHook
  cancelled: PhaseHook
  getDetail(): Partial<Detail>
}
