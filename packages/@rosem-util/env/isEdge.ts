import UA from './ua'

const isEdge: boolean = Boolean(UA && UA.indexOf('edge/') > 0)

export default isEdge
