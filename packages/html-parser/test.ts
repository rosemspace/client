// import HTMLParser from '@rosemlabs/html-parser'
import createTokenTree from './tokenizer/createTokenTree'
import scheme from './tokenizer/htmlScheme'
import tokenize from './tokenizer/tokenize'

// @ts-ignore
// window.p = new HTMLParser()
//@ts-ignore
window.tokenize = tokenize
console.log(createTokenTree(scheme))

const textarea = document.querySelector('textarea') as HTMLTextAreaElement
const table = document.querySelector('table') as HTMLTableElement

textarea.addEventListener('input', () => {
  table.innerHTML = ''
  let index = 0
  for (const token of tokenize(textarea.value)) {
    const row = document.createElement('tr')
    const td0 = document.createElement('td')
    const td1 = document.createElement('td')
    const td2 = document.createElement('td')
    const td3 = document.createElement('td')
    td0.textContent = String(++index)
    td1.textContent = token[0]
    td2.textContent = token[1]
    td3.textContent = token[2]
    row.appendChild(td0)
    row.appendChild(td1)
    row.appendChild(td2)
    row.appendChild(td3)
    table.appendChild(row)
  }
})
