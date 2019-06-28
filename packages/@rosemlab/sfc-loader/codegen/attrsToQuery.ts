import qs from 'querystring'

// transform the attrs on a SFC block descriptor into a resourceQuery string
export default function attrsToQuery(attrs: {[name: string]: string}) {
  let query = ''

  for (const name in attrs) {
    const value = attrs[name]

    query += `&${qs.escape(name)}${value ? `=${qs.escape(value)}` : ''}`
  }

  return query
}
