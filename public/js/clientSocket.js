let connected = false

socket = io("http://localhost:3000/")

socket.emit("setup", userLoggedIn)
socket.on("connected", () => connected = true)