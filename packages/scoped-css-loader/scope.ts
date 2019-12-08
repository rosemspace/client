import querystring, { ParsedUrlQuery } from 'querystring'

export type ScopeOptions = Partial<{
  scopeId: string | number
  scopePrefix: string
  scopeType: ScopeType
}>

export type Scope = {
  id: string
  type: ScopeType
}

export type ScopeType = 'class' | 'attr'

export function getScopeInfo(query: string, scopeOptions: ScopeOptions): Scope {
  // `.slice(1)` - remove "?" character
  const parsedQuery: ParsedUrlQuery = querystring.parse(query.slice(1))
  const id: string =
    null != parsedQuery.scopeId
      ? String(parsedQuery.scopeId)
      : String(scopeOptions.scopeId) ?? ''
  const type: string | undefined =
    null != parsedQuery.scopeType && parsedQuery.scopeType !== ''
      ? String(parsedQuery.scopeType)
      : scopeOptions.scopeType

  assertIsScopeType(type)

  return { id, type }
}

export function assertIsScopeType(
  scopeType?: string
): asserts scopeType is ScopeType {
  if (null != scopeType && scopeType !== 'class' && scopeType !== 'attr') {
    throw new TypeError('Scope type should be "class" or "attr"')
  }
}
