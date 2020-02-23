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
    if (!Object.prototype.hasOwnProperty.call(this, key)) {
      continue
    }

    yield [key, this[key]]
  }
}
