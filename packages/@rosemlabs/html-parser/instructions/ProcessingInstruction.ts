// import {
//   processingInstructionRegExp,
//   processingInstructionStartRegExp,
// } from '@rosemlabs/xml-syntax'
// import { Content, MatchRange, StartTag } from '../nodes'
//
// const textStartRegExp: RegExp = /^[^<]+?/
//
// function parseSection(source: string, regExp: RegExp): Token | void {
//   const contentMatch: RegExpMatchArray | null = source.match(regExp)
//
//   if (!contentMatch) {
//     return
//   }
//
//   return {
//     raw: contentMatch[1],
//     length: contentMatch[0].length,
//   }
// }
//
// interface TokenParser {
//   name: string
//   matchStart: RegExp
//   parse(source: string): Token | void
// }
//
// interface Token {
//   raw: string
//   length: number
//   [prop: string]: any
// }
//
// // interface ProcessorContext<NodeUnion> {
// //   nodeParsers: {[name: string]: TokenParser<NodeUnion>}
// //   sourceCursor: number
// //   readonly tagStack: StartTag[]
// //   readonly rootTagStack: StartTag[]
// // }
//
// const processingInstructionToken: TokenParser = {
//   name: 'processingInstruction',
//   matchStart: processingInstructionStartRegExp,
//   parse(source: string): Token | void {
//     return parseSection(source, processingInstructionRegExp)
//   },
// }
//
// const textToken: TokenParser = {
//   name: 'text',
//   matchStart: textStartRegExp,
//   parse(source: string): Token | void {
//     let textEndTokenIndex: number = source.indexOf('<')
//
//     if (!textEndTokenIndex) {
//       return
//     }
//
//     if (textEndTokenIndex > 0) {
//       let rest = source.slice(textEndTokenIndex)
//       let ignoreCharIndex
//
//       // Do not treat character "<" in plain text as a parser instruction
//       while (
//         !this.activeProcessor.startsWithInstruction.call(this, rest) &&
//         (ignoreCharIndex = rest.indexOf('<', 1)) >= 0
//         ) {
//         textEndTokenIndex += ignoreCharIndex
//         rest = this.source.slice(textEndTokenIndex)
//       }
//
//       source = source.slice(0, textEndTokenIndex)
//     }
//
//     // Ensure we don't have an empty string
//     if (source) {
//       return {
//         raw: source,
//         length: source.length,
//       }
//     }
//   },
// }
//
// class Tokenizer {
//   private source: string = ''
//   private sourceCursor: number = 0
//   private tokenParsers: TokenParser[] = []
//
//   tokenize(source: string): void {
//     this.source = source
//     this.sourceCursor = 0
//     this.processHook('start')
//
//     while (this.source) {
//       for (let index = 0; index < this.tokenParsers.length; ++index) {
//         const tokenParser: TokenParser = this.tokenParsers[index]
//
//         // Find a token
//         if (!tokenParser.matchStart.test(this.source)) {
//           continue
//         }
//
//         const token: Token | void = tokenParser.parse(this.source)
//
//         if (!token /* || !token.length*/) {
//           continue
//         }
//
//         this.source = this.source.slice(token.length)
//         this.sourceCursor += token.length
//         this.processHook(tokenParser.name, token)
//       }
//     }
//
//     this.processHook('end')
//   }
//
//   registerTokenParser(tokenParser: TokenParser): void {
//     this.tokenParsers.push(tokenParser)
//   }
//
//   processHook(hookName: string, token?: Token): void {}
//
//   startsWithInstruction(): boolean {
//     return this.tokenParsers.some((tokenParser: TokenParser): boolean =>
//       tokenParser.matchStart.test(this.source)
//     )
//   }
// }
