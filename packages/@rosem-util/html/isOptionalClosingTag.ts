import makeMap from '@rosem-util/common/makeMap'

// Elements that you can, intentionally, leave open
// (and which close themselves)
const isOptionalClosingTag: Function = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

export default isOptionalClosingTag
