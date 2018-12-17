import MiddlewareInterface, { Details, Phase } from './MiddlewareInterface'

export default interface MiddlewareRunnerInterface {
  use(middleware: MiddlewareInterface): void

  run(phase: Phase, details: Details): Details
}
