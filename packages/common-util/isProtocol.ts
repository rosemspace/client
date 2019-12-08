import toArray from 'lodash/toArray'

export const createProtocolRegExp: (protocol: string) => RegExp = (
  protocol: string
): RegExp =>
  new RegExp(
    `^[\u0000-\u001F ]*${toArray(`${protocol}:`).join('[\\r\\n\\t]*')}`,
    'i'
  )

const isProtocol: (protocol: string, url: string) => boolean = (
  protocol: string,
  url: string
): boolean => {
  return createProtocolRegExp(protocol).test(url)
}

export default isProtocol

export const javaScriptProtocolRegExp = createProtocolRegExp('javascript')

export const isJavaScriptProtocol: (url: string) => boolean = (
  url: string
): boolean => javaScriptProtocolRegExp.test(url)
