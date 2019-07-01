declare type Primitive = string | number | boolean

declare type Mutable<T> = { -readonly [P in keyof T]: T[P] }
