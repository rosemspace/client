export type NormalizedRuleSetCondition = (path: string) => boolean

export type NormalizedRuleSetUseItem = {
  loader: string
  options: string
  // options?: { [key: string]: any }
  ident?: string
  // query?: string
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
