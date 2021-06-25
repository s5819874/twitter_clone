const { $where } = require("../../models/userSchema")

let connected = false

socket = io("http://localhost:3000/")

socket.emit("setup", userLoggedIn)
socket.on("connected", () => connected = true)
socket.on("message received", newMessage => messageReceived(newMessage))

socket.on("notification received", () => {
  $.get("/api/notifications/latest", notification => {
    refreshNotificationsBadge()
    showNotificationPopup(notification)
  })
})

function emitNotification(userId) {
  if (userId === userLoggedIn._id) return

  socket.emit("notification received", userId)
}


