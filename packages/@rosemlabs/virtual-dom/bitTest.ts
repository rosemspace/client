enum Operation {
  Op1 = 1<<0,
  Op2 = 1<<1,
  Op3 = 1<<2,
  Op4 = 1<<3,
}
enum Case {
  // 1 operation
  Case1 = Operation.Op1,
  // 2 operations
  Case2 = Operation.Op2,
  Case3 = Operation.Op1 | Operation.Op2,
  // 3 operations
  Case4 = Operation.Op3,
  Case5 = Operation.Op1 | Operation.Op3,
  Case6 = Operation.Op2 | Operation.Op3,
  Case7 = Operation.Op1 | Operation.Op2 | Operation.Op3,
  // 4 operations
  Case8 = Operation.Op4,
  Case9 = Operation.Op1 | Operation.Op4,
  Case10 = Operation.Op2 | Operation.Op4,
  Case11 = Operation.Op1 | Operation.Op2 | Operation.Op4,
  Case12 = Operation.Op3 | Operation.Op4,
  Case13 = Operation.Op1 | Operation.Op3 | Operation.Op4,
  Case14 = Operation.Op2 | Operation.Op3 | Operation.Op4,
  Case15 = Operation.Op1 | Operation.Op2 | Operation.Op3 | Operation.Op4,
}
