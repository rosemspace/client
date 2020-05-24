import { Class } from 'type-fest'

function toNumber(value: number | { toNumber(): number }): number {
  return typeof value === 'number' ? value : value.toNumber()
}

enum OperationType {
  UNARY = 0b001,
  BINARY = 0b010,
  TERNARY = 0b100,
}

function isOperationType(operation: Operation, type: OperationType): boolean {
  return Boolean(operation.type & type)
}

type Operand = number | Operation

abstract class Operation {
  abstract readonly type: OperationType
  abstract addOperand(operand: Operand): void
  abstract toNumber(): number
}

class SumOperation implements Operation {
  readonly type = OperationType.UNARY | OperationType.BINARY
  protected operands: Operand[] = []

  constructor(...operands: Operand[]) {
    this.operands = operands
  }

  addOperand(operand: Operand): void {
    this.operands.push(operand)
  }

  toNumber(): number {
    let result = 0

    this.operands.forEach((operand) => {
      result += toNumber(operand)
    })

    return result
  }
}

class SubtractOperation implements Operation {
  readonly type = OperationType.UNARY | OperationType.BINARY
  protected operands: Operand[] = []

  constructor(...operands: Operand[]) {
    this.operands = operands.filter((value) => value !== undefined) as Operand[]
  }

  addOperand(operand: Operand): void {
    this.operands.push(operand)
  }

  toNumber(): number {
    let result = toNumber(this.operands[0])

    for (let index = 1; index < this.operands.length; ++index) {
      result -= toNumber(this.operands[index])
    }

    return result
  }
}

class Calculator<T extends Operation> {
  protected operation: Operation | undefined
  protected operand = ''
  protected allowedNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  protected operationClassMap: Record<string, Class<Operation>> = {
    '+': SumOperation,
    '-': SubtractOperation,
  }

  calculate(input: string | undefined): typeof NaN | number {
    if (input) {
      this.parse(input)
    }

    const result = this.operation?.toNumber() ?? NaN

    this.operand = ''
    this.operation = undefined

    return result
  }

  parse(input: string) {
    for (let i = 0; i < input.length; ++i) {
      if (input[i] === ' ') {
        continue
      }

      this.input(input[i])
    }

    // EOF
    this.input('')
  }

  input(char: string): void {
    // EOF
    if (char === '') {
      this.operation?.addOperand(Number(this.operand))
    } else if (this.allowedNumbers.includes(Number(char))) {
      this.operand += char
    } else if (this.operationClassMap[char]) {
      this.operation?.addOperand(Number(this.operand))

      const operationClass = this.operationClassMap[char]

      if (!(this.operation instanceof operationClass)) {
        this.operation = new operationClass(
          this.operation ?? Number(this.operand)
        ) as Operation
      }

      this.operand = ''
    } else {
      throw new Error('Unknown input')
    }
  }
}

//@ts-ignore
window.Calculator = Calculator
//@ts-ignore
window.calc = new Calculator()
