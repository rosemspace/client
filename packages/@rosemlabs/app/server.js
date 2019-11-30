const express = require('express')
const app = express()
let welcome = 'Hello'

app.get('/:name?', (req, resp) => {
  const name = req.params.name

  if (name) {
    welcome += `, ${name}`
  }

  resp.send(welcome)
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
