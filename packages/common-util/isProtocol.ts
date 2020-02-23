import { toArray } from 'lodash'

const protocolMap: Record<string, RegExp> = {}

// A javascript: URL can contain leading C0 control or \u0020 SPACE,
// and any newline or tab are filtered out as if they're not part of the URL.
// https://url.spec.whatwg.org/#url-parsing
// Tab or newline are defined as \r\n\t:
// https://infra.spec.whatwg.org/#ascii-tab-or-newline
// A C0 control is a code point in the range \u0000 NULL to \u001F
// INFORMATION SEPARATOR ONE, inclusive:
// https://infra.spec.whatwg.org/#c0-control-or-space
export const getProtocolRegExp: (protocol: string) => RegExp = (
  protocol: string
): RegExp =>
  protocolMap[protocol] ??
  (protocolMap[protocol] = new RegExp(
    `^[\u0000-\u001F ]*${toArray(`${protocol}:`).join('[\\r\\n\\t]*')}`,
    'i'
  ))

const usesProtocol: (url: string, protocol: string) => boolean = (
  protocol: string,
  url: string
): boolean => getProtocolRegExp(protocol).test(url)

export default usesProtocol

// A javascript: URL is blocked as a security precaution.
export const javaScriptProtocolRegExp = getProtocolRegExp('javascript')

export const isJavaScriptProtocol: (url: string) => boolean = (
  url: string
): boolean => javaScriptProtocolRegExp.test(url)
