import CSSAnimationDeclaration from './CSSAnimationDeclaration'

export default function isAnimationMaxTimeout(
  { names, delays, durations, timeout }: CSSAnimationDeclaration,
  name: string
): boolean {
  const nameIndex: number = names.indexOf(name)

  return delays[nameIndex] + durations[nameIndex] === timeout
}
