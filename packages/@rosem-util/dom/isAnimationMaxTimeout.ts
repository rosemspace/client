import convertSStringToMs from '@rosem-util/time/convertSStringToMs'
import CSSAnimationDeclaration from './CSSAnimationDeclaration'

export default function isAnimationMaxTimeout(
  { names, delays, durations, timeout }: CSSAnimationDeclaration,
  name: string
): boolean {
  const nameIndex: number = names.indexOf(name)

  return (
    convertSStringToMs(delays[nameIndex]) +
      convertSStringToMs(durations[nameIndex]) ===
    timeout
  )
}
