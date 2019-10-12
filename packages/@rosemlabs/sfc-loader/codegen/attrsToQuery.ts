import { escape } from 'querystring'

// transform the attrs on a SFC block descriptor into a resourceQuery string
export default function attrsToQuery(attrs: {
  [name: string]: string | number | boolean
}) {
  let query = ''

  for (const name in attrs) {
    const value = attrs[name]

    query += `&${escape(name)}${value ? `=${escape(String(value))}` : ''}`
  }

  return query
}
