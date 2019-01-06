export default class ReactiveObjectStorage {
  target?: string
  dependencies: { [index: string]: Array<string> } = {}
  observers: { [index: string]: Array<Function> } = {}
  originalObject: any

  public constructor(object?: any) {
    this.originalObject = object
  }
}
