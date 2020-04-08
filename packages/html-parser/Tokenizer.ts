import { isArray } from 'lodash'
import { ErrorCode, errorMessages } from './errors'
import EventEmitter, { EventListener, EventMap } from './EventEmitter'
import TokenParser from './parsers/TokenParser'
import { SourceCodeRange } from './Token'

export type ParseError<T extends ErrorCode = ErrorCode> = {
  code: T
  message: string
  source: string
} & SourceCodeRange

export type CommonEventMap<T extends ErrorCode = ErrorCode> = {
  error: ParseError<T>
}

export type TokenizerEventMap<T extends ErrorCode = ErrorCode> = {
  start: string
  end: undefined
} & CommonEventMap<T>

export type HookMap<T extends EventMap> = Partial<
  {
    [K in keyof T]: EventListener<T[K]>
  }
>

export type Module<T extends EventMap, U extends ErrorCode = ErrorCode> = {
  register(tokenizer: Tokenizer<CommonEventMap<U> & T>): void
}

export default class Tokenizer<
  T extends CommonEventMap<U> & EventMap,
  U extends ErrorCode = ErrorCode
> extends EventEmitter<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly tokenParsers: TokenParser<any, U>[]
  source: string
  remainingSource: string
  cursorPosition = 0
  tokenParserIndex = -1
  currentToken?: T[keyof T]
  // // Used for raw text
  // raw?: boolean
  // // Used for conditional comment
  // conditional?: boolean

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokenParsers: TokenParser<any, U>[] = [],
    modules: Module<T, U> | Module<T, U>[] = [],
    source = ''
  ) {
    super()
    this.tokenParsers = tokenParsers
    this.source = this.remainingSource = source

    if (!isArray(modules)) {
      modules = [modules]
    }

    for (const module of modules) {
      this.addModule(module)
    }
  }

  addModule(module: Module<T, U>): void {
    module.register(this)
  }

  reset(source = ''): void {
    this.source = this.remainingSource = source
    this.cursorPosition = 0
    this.skipToken()
  }

  replaceToken(token: T[keyof T]): void {
    this.currentToken = token
  }

  skipToken(): void {
    this.tokenParserIndex = -1
    this.currentToken = undefined
  }

  get eof() {
    return this.remainingSource === ''
  }

  consume(n = 1): number {
    this.remainingSource = this.remainingSource.slice(n)

    return (this.cursorPosition += n)
  }

  *token(): Generator<T[keyof T]> {
    for (
      this.tokenParserIndex = 0;
      this.tokenParserIndex < this.tokenParsers.length;
      ++this.tokenParserIndex
    ) {
      this.tokenParsers[this.tokenParserIndex].parse(
        this.remainingSource,
        undefined,
        this
      )

      if (this.currentToken) {
        yield this.currentToken

        this.currentToken = undefined
      } else if (this.eof) {
        return
      }
    }

    yield* this.token()
  }

  emit<Name extends keyof T>(
    event: Name,
    ...args: Parameters<EventListener<T[Name]>>
  ): boolean {
    this.currentToken = args[0]

    if (!this.listeners[event]) {
      return false
    }

    for (const listener of this.listeners[event]) {
      // Some modules can skip the current token
      if (!this.currentToken) {
        break
      }

      listener.apply(this, args)
    }

    return true
  }

  error(code: U, sourceCodeRange: SourceCodeRange): ParseError<U> {
    return {
      code,
      message: errorMessages[code],
      source: this.source,
      ...sourceCodeRange,
    }
  }
}
