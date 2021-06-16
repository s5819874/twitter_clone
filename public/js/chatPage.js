let lastTypingTime
let typing = false

$(document).ready(() => {

  socket.emit("join room", chatId)
  socket.on("typing", () => $(".typingDots").show())
  socket.on("stop typing", () => $(".typingDots").hide())

  $.get(`/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data))
  })

  $.get(`/api/chats/${chatId}/messages`, (data) => {

    let messages = []
    let lastSenderId = ""

    data.forEach((message, index) => {
      const html = createMessageHtml(message, data[index + 1], lastSenderId)
      messages.push(html)

      lastSenderId = message.sender._id
    })

    const messagesHtml = messages.join("")
    addChatMessageHtmlToPage(messagesHtml)

    scrollToBottom(false)

    $(".loadingSpinnerContainer").remove()
    $(".chatContainer").css("visibility", "visible")

  })
})

$("#chatNameButton").click(() => {
  const chatName = $("#chatNameTextbox").val().trim()

  $.ajax({
    url: `/api/chats/${chatId}`,
    type: "PUT",
    data: { chatName },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        return alert("Could not update chat name.")
      } else {
        location.reload()
      }
    }
  })
})

$(".sendMessageButton").click(() => {
  messageSumitted()
})

$(".inputTextbox").keydown((event) => {

  updateTyping()

  if (event.which === 13) {
    messageSumitted()
    return false //避免換行
  }

})

function updateTyping() {
  if (!connected) return

  if (!typing) {
    typing = true
    socket.emit("typing", chatId)
  }

  lastTypingTime = new Date().getTime()
  let timeLength = 3000

  setTimeout(() => {
    const timeNow = new Date().getTime()
    const timeDiffs = timeNow - lastTypingTime

    if (timeDiffs >= timeLength && typing) {
      socket.emit("stop typing", chatId)
      typing = false
    }
  }, timeLength)


}

function messageSumitted() {
  const content = $(".inputTextbox").val().trim()

  if (content) {
    sendMessage(content)
    $(".inputTextbox").val("")
    socket.emit("stop typing", chatId)
    typing = false
  }

}

function sendMessage(content) {
  $.post("/api/messages", { content, chatId }, (data, status, xhr) => {

    if (xhr.status !== 201) {
      alert("Could not send message")
      return $(".inputTextbox").val(content)
    }
    addChatMessage(data)

    if (connected) {
      socket.emit("new message", data)
    }

  })
}

function addChatMessage(message) {
  if (!message || !message._id) return alert("Message invalid!")

  const messageDiv = createMessageHtml(message, null, "")
  addChatMessageHtmlToPage(messageDiv)

  scrollToBottom(true)

}

function createMessageHtml(message, nextMessage, lastSenderId) {

  const sender = message.sender
  const senderName = sender.firstName + " " + sender.lastName

  const currentSenderId = sender._id

  //有些訊息串只有一則留言，沒有nextMessage
  const nextSenderId = nextMessage ? nextMessage.sender._id : ""

  const isFirst = lastSenderId !== currentSenderId
  const isLast = nextSenderId !== currentSenderId

  const isMine = message.sender._id === userLoggedIn._id
  let liClassName = isMine ? "mine" : "theirs"

  let nameElement = ""

  if (isFirst) {
    liClassName += " first"

    if (!isMine) nameElement = `<span class='senderName'>${senderName}</span>`
  }

  let profilePic = ""
  if (isLast) {
    liClassName += " last"

    profilePic = `<img src='${sender.profilePic}'>`
  }


  let imageContainer = ""
  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                        ${profilePic}
                      </div>`
  }


  return `<li class="message ${liClassName}">
            ${imageContainer}
            <div class="messageContainer">
              ${nameElement}
              <span class="messageBody">
                ${message.content}
              </span>
            </div>
          </li>`
}

function addChatMessageHtmlToPage(html) {
  $(".chatMessages").append(html)
}

function scrollToBottom(animated) {

  let container = $(".chatMessages")
  let scrollHeight = container[0].scrollHeight

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, "slow")
  } else {
    container.scrollTop(scrollHeight)
  }
}