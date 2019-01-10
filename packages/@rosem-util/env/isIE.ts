import UA from './ua'

const isIE: boolean = Boolean(UA && /msie|trident/.test(UA))

export default isIE
