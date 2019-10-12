import UA from './ua'
import isEdge from './isEdge'

const isChrome: boolean = Boolean(UA && /chrome\/\d+/.test(UA) && !isEdge)

export default isChrome
