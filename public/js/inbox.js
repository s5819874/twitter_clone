$(document).ready(() => {
  $.get("api/chats", (data, status, xhr) => {
    if (xhr === 400) {
      alert("Counld not get chat list")
    } else {
      outputChatList(data, $(".usersContainer"))
    }
  })
})

function outputChatList(chatList, container) {
  chatList.forEach(chat => {
    let html = createChatHtml(chat)
    container.append(html)
  })

  if (chatList.length === 0) {
    container.append('<span class="noResults"> No chats found.</span>')
  }
}

