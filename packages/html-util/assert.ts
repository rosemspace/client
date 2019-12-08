/**
 * Unicode characters used for parsing html tags, component names and property
 * paths. Using
 * https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF (emoji) due to it freezing up PhantomJS
 */
export const isHTMLNameCharCode = (
  charCode: number
): boolean =>
  (charCode >= 65 && charCode <= 90) ||
  charCode === 95 ||
  (charCode >= 97 && charCode <= 122) ||
  charCode === 183 ||
  (charCode >= 192 &&
    charCode <= 8191 &&
    charCode !== 215 &&
    charCode !== 247 &&
    charCode !== 894) ||
  charCode === 8204 ||
  charCode === 8205 ||
  (charCode >= 8255 && charCode <= 8256) ||
  (charCode >= 8304 && charCode <= 8591) ||
  (charCode >= 11264 && charCode <= 12271) ||
  (charCode >= 12289 && charCode <= 55295) ||
  (charCode >= 63744 && charCode <= 64975) ||
  (charCode >= 65008 && charCode <= 65533)
// || (charCode >= 4096 && charCode <= 61439)
