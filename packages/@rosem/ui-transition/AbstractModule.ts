import ModuleInterface, { Detail, Phase } from './ModuleInterface'

export default abstract class AbstractModule extends Array
  implements ModuleInterface {
  public length: number = Phase.length

  public [Phase.Cleanup](detail: Detail): void {}

  public [Phase.BeforeStart](detail: Detail): void {}

  public [Phase.Start](detail: Detail): void {}

  public [Phase.AfterEnd](detail: Detail): void {}

  public [Phase.Cancelled](detail: Detail): void {}
}
