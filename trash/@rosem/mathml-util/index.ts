/**
 * Normalize a MathML attribute name to its proper case and form.
 * Note, all MathML element names are lowercase.
 * https://html.spec.whatwg.org/multipage/parsing.html#adjust-mathml-attributes
 */
export function normalizeMathMLAttribute(name: string): string {
  // Only one attribute has a mixed case form for MathML.
  return 'definitionurl' === name.toLowerCase() ? 'definitionURL' : name
}
