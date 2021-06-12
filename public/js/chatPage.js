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