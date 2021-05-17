const express = require('express')
const app = express()
const port = 3000
const pug = require('pug')

const routes = require('./routes')
require('./config/mongoose')

const server = app.listen(port, () => console.log(`Server is listening on port:${port}!`))

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.static('public'))
app.use(routes)