import makeMap from '@rosem-util/common/makeMap'

// Elements that you can, intentionally, leave open
// (and which close themselves)
const optionalClosingTag: Function = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
)

export default optionalClosingTag
