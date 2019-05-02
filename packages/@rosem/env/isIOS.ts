import UA from './ua'

const isIOS: boolean = Boolean(UA && /iphone|ipad|ipod|ios/.test(UA))

export default isIOS
