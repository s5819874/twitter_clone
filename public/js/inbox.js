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

function createChatHtml(chat) {
  const chatName = getChatName(chat)
  const image = getChatImageElements(chat)
  const latestMessage = "News!!!!!"

  return `<a href="/messages/${chat._id}" class="resultListItem">
              ${image}
              <div class="resultsDetailsContainer ellipsis">
                <span class="heading ellipsis"> ${chatName}</span>
                <span class="subtext ellipsis"> ${latestMessage}</span>
              </div>
          </a>`
}

function getChatImageElements(chat) {
  let otherUsers = getOtherUsers(chat.users)
  let groupChatClass = ""

  let chatImage = getUserChatImageElement(otherUsers[0])

  if (otherUsers.length > 1) {
    groupChatClass = "groupChatImage"
    chatImage += getUserChatImageElement(chat.users[1])
  }

  return `<div class="resultImageContainer ${groupChatClass}">${chatImage}</div>`


}

function getUserChatImageElement(user) {
  if (!user || !user.profilePic) return alert("User passed into function is invalid")

  return `<img src="${user.profilePic}" alt="User profile pic">`
}