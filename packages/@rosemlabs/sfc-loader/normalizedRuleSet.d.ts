export type NormalizedRuleSetCondition = (path: string) => boolean

export type NormalizedRuleSetUseItem = {
  ident?: string
  loader?: string
  options?: { [key: string]: any }
  query?: string
}

export type NormalizedRuleSetUse = NormalizedRuleSetUseItem[]

export type NormalizedRuleSetRule = {
  resource: NormalizedRuleSetCondition
  resourceQuery: NormalizedRuleSetCondition
  compiler: NormalizedRuleSetCondition
  issuer: NormalizedRuleSetCondition
  use: NormalizedRuleSetUse
  rules?: NormalizedRuleSetRule[]
  oneOf?: NormalizedRuleSetRule[]
}
