import {
  VirtualContentNode
} from '@rosem/virtual-dom'

// lcfirst - lowerCaseFirst
// ucfirst - upperCaseFirst
interface ASTTokenFilter {}

interface ASTToken {
  binding: string | number,
  filter?: ASTTokenFilter,
}

export default interface ASTExpression extends VirtualContentNode {
  expression: string
  tokens: Array<ASTToken | string>
}
