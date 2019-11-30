import {
  VirtualCharacterData
} from '@rosemlabs/virtual-dom'

// lcfirst - lowerCaseFirst
// ucfirst - upperCaseFirst
interface ASTTokenFilter {}

interface ASTToken {
  binding: string | number,
  filter?: ASTTokenFilter,
}

export default interface ASTExpression extends VirtualCharacterData {
  expression: string
  tokens: Array<ASTToken | string>
}
