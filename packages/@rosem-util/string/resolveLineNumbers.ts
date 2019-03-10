// function resolveLineNumbers(lines, start) {
//   let l = 0
//   let cur = 0
//   for (let i = 0, len = lines.length; i < len; ++i) {
//     const { line, linefeed = '' } = lines[i]
//     if (cur + line.length < start) {
//       cur += (line.length + linefeed.length)
//       l++
//     } else {
//       break
//     }
//   }
//   return {
//     line: l,
//     column: start - cur
//   }
// }
