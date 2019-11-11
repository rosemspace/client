import UA from './ua'

const isAndroid: boolean = Boolean(UA && UA.indexOf('android') > 0)

export default isAndroid
