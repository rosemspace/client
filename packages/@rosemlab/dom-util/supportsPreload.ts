const link: HTMLLinkElement = document.createElement('link')
const relList: DOMTokenList = link.relList

export default Boolean(
  relList && relList.supports && relList.supports('preload')
)
