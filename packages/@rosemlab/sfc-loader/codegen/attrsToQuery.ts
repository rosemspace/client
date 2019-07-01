import querystring from 'querystring'
import { AttrMap } from '@rosemlab/xml-parser/modules/AttrMapModule'

// transform the attrs on a SFC block descriptor into a resourceQuery string
export default function attrsToQuery(attrs: AttrMap) {
  let query = ''

  for (const name in attrs) {
    const value = attrs[name]

    query += `&${querystring.escape(name)}${
      value ? `=${querystring.escape(String(value))}` : ''
    }`
  }

  return query
}
