$(document).ready(() => {

  $.get("/api/notifications", data => {
    outputNotifications(data, $(".usersContainer"))
  })
})

$("#markNotificationsAsRead").click(() => markNotificationAsOpened())


