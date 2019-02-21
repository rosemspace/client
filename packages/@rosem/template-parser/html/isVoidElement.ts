// Elements that cannot have children
export default function isVoidElement(tag: string): boolean {
  // <area>, <base>, <br>, <col>, <embed>, <frame>, <hr>, <img>, <input>,
  // <isindex>, <keygen>, <link>, <meta>, <param>, <source>, <track>, <wbr>
  return /^(area|b(?:ase|r)|col|embed|frame|hr|i(?:mg|nput|sindex)|keygen|link|meta|param|source|track|wbr)$/i.test(
    tag
  )
}
