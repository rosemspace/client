// Elements that you can, intentionally, leave open
// (and which close themselves)
export default function isOptionalClosingTag(tag: string): boolean {
  // colgroup, dd, dt, li, options, p, td, th, thead, tfoot, tr, source
  return /^(colgroup|d[dt]|li|options|p|t(?:[dhr]|head|foot)|source)$/i.test(
    tag
  )
}
