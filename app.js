const express = require('express')
const app = express()
const port = 3000
const pug = require('pug')

const server = app.listen(port, () => console.log(`Server is listening on port:${port}!`))

app.set('view engine', 'pug')
app.set('views', 'views')

app.get('/', (req, res, next) => {
  const payload = {
    pagetitle: 'Home'
  }
  res.status(200).render('home', payload)
})