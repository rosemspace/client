// import {
//   HTMLParserHooks,
//   Token,
//   TokenHook,
//   Tokenizer
// } from '@rosemlabs/html-parser-2'
// import HTMLParser from '@rosemlabs/html-parser-2/HTMLParser'
// import TextParser from '@rosemlabs/html-parser-2/markup/TextParser'
//
// //@ts-ignore
// globalThis.parser = new HTMLParser()
// //@ts-ignore
// globalThis.TextParser = TextParser
//
// type CustomToken = { love: string } & Token
// type CustomHooks = { onRosem?: TokenHook<CustomToken> } & HTMLParserHooks
//
// const hp = new HTMLParser<CustomHooks>()
//
// hp.addMarkupParser({
//   test(source: string): boolean {
//     return source.startsWith('<rosem>')
//   },
//   parse(source: string, tokenizer: Tokenizer<CustomHooks>): void | Token {
//     if (!this.test(source)) {
//       return
//     }
//
//     tokenizer.consume(7)
//     tokenizer.emit('onRosem', {
//       love: 'I love rosem',
//       __starts: tokenizer.cursorPosition,
//       __ends: tokenizer.cursorPosition - 5,
//     })
//   },
// })
// hp.addModule({
//   onRosem(token: CustomToken) {
//     console.log(token.love)
//   },
// })
// //@ts-ignore
// globalThis.hp = hp
