import { ErrorCodes } from './error'

const apply = Reflect.apply

export type SourceCodeRange = {
  __starts: number
  __ends: number
}

export type ParseError = {
  code: ErrorCodes
  message: string
} & SourceCodeRange

export type Token = SourceCodeRange

export interface TokenIdentifier {
  test(source: string): boolean
  // exec(source: string): string[] | null
}

// export interface TokenAnalyzer<T extends Node> {
//   analyze(tokenChunks: string[], state: State): T | void
// }

export interface TokenParser<
  T extends Token,
  U extends TokenHooks /*, V extends U = U*/
> extends TokenIdentifier {
  parse(source: string, tokenizer: Tokenizer<U>): T | void
}

export type StartHook = (source: string) => any

export type EndHook = () => any

export type ErrorHook = <T extends ParseError = ParseError>(
  error: ParseError
) => any

export type TokenHook<T extends Token> = <U extends T>(
  token: U,
  ...args: any[]
) => any

// export type TokenHooks = {[tokenHookName: string]: TokenHook<Token>}
export type TokenHooks = Partial<Record<string, TokenHook<Token>>>

export type TokenizerHooks = Partial<{
  start: StartHook
  end: EndHook
  error: ErrorHook
}>

export type WithErrorHook<T extends TokenHooks> = T &
  Pick<TokenizerHooks, 'error'>

export type Module<T extends TokenHooks> = TokenizerHooks & T
// export type Plugin<HookName extends string> = TokenizerHooks & Record<HookName, TokenHook<Token>>
// export type Plugin = TokenizerHooks

export default class Tokenizer<T extends TokenHooks> implements TokenizerHooks {
  protected readonly tokenParsers: TokenParser<Token, T>[]
  protected readonly modules: Module<T>[] = []
  source: string
  remainingSource: string
  cursorPosition: number = 0
  tokenParserIndex: number = -1
  currentToken?: Token
  // // Used for raw text
  // raw?: boolean
  // // Used for conditional comment
  // conditional?: boolean

  constructor(
    tokenParsers: TokenParser<Token, T>[] = [],
    modules: Module<T>[] = [],
    source = ''
  ) {
    this.tokenParsers = tokenParsers
    this.modules = modules
    this.source = this.remainingSource = source
  }

  reset(): void {
    this.source = this.remainingSource = ''
    this.cursorPosition = 0
    this.tokenParserIndex = -1
    this.currentToken = undefined
  }

  get eof() {
    return this.remainingSource === ''
  }

  advance(n: number): number {
    this.remainingSource = this.remainingSource.slice(n)

    return (this.cursorPosition += n)
  }

  *token(): Generator<Token> {
    for (
      this.tokenParserIndex = 0;
      this.tokenParserIndex < this.tokenParsers.length;
      ++this.tokenParserIndex
    ) {
      this.tokenParsers[this.tokenParserIndex].parse(this.remainingSource, this)

      if (this.currentToken) {
        yield this.currentToken

        this.currentToken = undefined
      } else if (this.eof) {
        return
      }
    }

    yield* this.token()
  }

  replaceToken(token: Token): void {
    this.currentToken = token
  }

  skipToken(): void {
    this.tokenParserIndex = -1
    this.currentToken = undefined
  }

  start(source: string): void {
    this.source = this.remainingSource = source

    for (const module of this.modules) {
      // Some modules can skip start hook
      if (!module.start) {
        continue
      }

      module.start(source)
    }
  }

  end(): void {
    for (const module of this.modules) {
      // Some modules can skip end hook
      if (!module.end) {
        continue
      }

      module.end()
    }
  }

  error(error: ParseError): void {
    for (const module of this.modules) {
      // Some modules can skip error hook
      if (!module.error) {
        continue
      }

      module.error(error)
    }
  }

  emit<HookName extends keyof T>(
    hook: HookName,
    ...args: Required<T>[HookName] extends (...args: any) => any
      ? Parameters<Required<T>[HookName]>
      : never
  ): void {
    this.currentToken = args[0]

    for (const module of this.modules) {
      // Some modules can skip some hooks
      if (!module[hook]) {
        continue
      }

      // Some modules can skip the current token
      if (!this.currentToken) {
        break
      }

      apply(module[hook]!, module, args)
    }
  }
}
