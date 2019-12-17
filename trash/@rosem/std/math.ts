export const abs = (value: number): number => (value < 0 ? -value : value)

export const ceil = (value: number): number => ~~value + Number(value > ~~value)

export const floor = (value: number): number =>
  ~~value - Number(value < ~~value)

export const roundDown = (value: number): number =>
  ~~value - Number(!(~~value - value < 0.5))

export const roundUp = (value: number): number =>
  ~~value + Number(!(value - ~~value < 0.5))

export const round = (value: number): number =>
  value < 0 ? roundDown(value) : roundUp(value)

export const sign = (value: number): number => (value < 0 ? -1 : 1)

export const trunc = (value: number): number => ~~value
