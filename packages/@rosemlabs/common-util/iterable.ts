export function* plainObjectIterator<T extends object>(
  this: T
): Generator<[keyof T, T[keyof T]]> {
  for (const key in this) {
    // noinspection JSUnfilteredForInLoop
    yield [key, this[key]]
  }
}

export function* objectIterator<T extends object>(
  this: T
): Generator<[keyof T, T[keyof T]]> {
  for (const key in this) {
    if (!this.hasOwnProperty(key)) {
      continue
    }

    yield [key, this[key]]
  }
}
