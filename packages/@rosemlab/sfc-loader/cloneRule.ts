import { RuleSetRule } from 'webpack'
import querystring, { ParsedUrlQuery } from 'querystring'
import { NormalizedRuleSetRule } from './normalizedRuleSet'
import { SFC_KEYWORD } from './'

export default function cloneRule(
  rule: NormalizedRuleSetRule,
  fileExtension = SFC_KEYWORD
): RuleSetRule {
  const { resource, resourceQuery } = rule
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource: string

  const newRule: RuleSetRule = {
    ...rule,
    resource: {
      test(resource: string): true {
        currentResource = resource

        return true
      },
    },
    resourceQuery(query: string): boolean {
      // console.log('\n', currentResource, '\n', query, '\n');
      const parsed: ParsedUrlQuery = querystring.parse(query.slice(1))

      return (
        null != parsed[fileExtension] &&
        (!resource ||
          (null != parsed.lang &&
            resource(`${currentResource}.${parsed.lang}`))) &&
        (!resourceQuery || resourceQuery(query))
      )
    },
  }

  if (rule.oneOf) {
    newRule.oneOf = rule.oneOf.map(() => cloneRule(rule, fileExtension))
  }

  return newRule
}
