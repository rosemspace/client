import inBrowser from './inBrowser'

const UA: string | false = inBrowser && window.navigator.userAgent.toLowerCase()

export default UA
