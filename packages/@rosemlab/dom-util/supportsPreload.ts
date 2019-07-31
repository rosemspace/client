import { inBrowser } from '@rosemlab/env'

let supportsPreload: boolean = false

if (inBrowser) {
  const link: HTMLLinkElement = document.createElement('link')
  const relList: DOMTokenList = link.relList

  supportsPreload = Boolean(
    relList && relList.supports && relList.supports('preload')
  )
}

export default supportsPreload
