const express = require('express')
const pug = require('pug')
const bodyParser = require('body-parser')
const session = require('express-session')

const routes = require('./routes')
require('./config/mongoose')
const usePassport = require('./config/passport')

const app = express()
const port = 3000

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'YOUWILLNEVERKNOW',
  resave: false,
  saveUninitialized: true
}))
usePassport(app)
app.use(routes)

const server = app.listen(port, () => console.log(`Server is listening on port:${port}!`))
const io = require('socket.io')(server, { pinTimeout: 6000 })

io.on("connection", (socket) => {
  socket.on("setup", userData => {
    socket.join(userData._id)
    socket.emit("connected")
  })

  socket.on("join room", room => socket.join(room))
  socket.on("typing", room => socket.in(room).emit("typing"))
  socket.on("stop typing", room => socket.in(room).emit("stop typing"))

  socket.on("new message", newMessage => {
    const chat = newMessage.chat

    if (!chat.users) return console.log("Chat.users not defined.")

    chat.users.forEach(user => {
      if (user._id === newMessage.sender._id) return
      socket.in(user._id).emit("message received", newMessage)
    })
  })

})