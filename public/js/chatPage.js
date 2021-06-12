$(document).ready(() => {
  $.get(`/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data))
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

  if (event.which === 13) {
    messageSumitted()
    return false //避免換行
  }

})

function messageSumitted() {
  const content = $(".inputTextbox").val().trim()

  if (content) {
    sendMessage(content)
    $(".inputTextbox").val("")
  }

}

function sendMessage(content) {
  $.post("/api/messages", { content, chatId }, (data, status, xhr) => {
    console.log(data)
  })
}

