function onGet<T extends object>(
  target: T,
  property: PropertyKey,
  receiver: any
): any {
  console.log(property)
  // @ts-ignore
  return target[property]
}

function onSet<T extends object>(
  target: T,
  property: PropertyKey,
  value: any,
  receiver: any
): any {
  console.log(property)
  // @ts-ignore
  target[property] = value

  return true
}

export function create<T extends object>(target: T): T {
  return new Proxy(target, {
    get: onGet,
    set: onSet,
  })
}

export default class Index<T extends object> {
  static test() {
    const oo = create({
      roshe: 'ROSHE',
      rosem: {
        love: 'ROSEM',
      },
    })
    const t = oo.rosem.love
  }
}
