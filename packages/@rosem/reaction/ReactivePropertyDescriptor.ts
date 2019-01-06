export default interface ReactivePropertyDescriptor {
  value: any
  shallow?: boolean
  get?(): any
  set?(value: any): void
}
