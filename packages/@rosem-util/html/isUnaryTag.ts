import makeMap from '@rosem-util/common/makeMap'

const isUnaryTag: Function = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
)

export default isUnaryTag
