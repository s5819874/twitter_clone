$(document).ready(() => {

  $.get("/api/notifications", data => {
    outputNotifications(data, $(".usersContainer"))
  })
})

$("#markNotificationsAsRead").click(() => markNotificationAsOpened())


function outputNotifications(notifications, container) {
  notifications.forEach(notification => {
    const html = createNotificationHtml(notification)
    container.append(html)
  })

  if (notifications.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function createNotificationHtml(notification) {

  const userFrom = notification.userFrom
  const text = getNotificationText(notification)
  const herf = getNotificationUrl(notification)
  const className = notification.opened ? "" : "active"

  return `<a href='${herf}' class="resultListItem notification ${className}" data-id='${notification._id}'>

            <div class='resultImageContainer'>
              <img src='${userFrom.profilePic}'>
            </div>

            <div class="resultsDetailsContainer ellipsis">
              <span class="ellipsis">${text}</span>
            </div>
          </a>`
}

function getNotificationText(notification) {
  const userFrom = notification.userFrom
  const firstName = userFrom.firstName
  const lastName = userFrom.lastName

  if (!firstName || !lastName) {
    return alert("User from data not populated!")
  }

  const userName = firstName + " " + lastName
  let text

  if (notification.notificationType === "postLike") {
    text = `${userName} liked one of your posts`
  }
  else if (notification.notificationType === "retweet") {
    text = `${userName} retweeted one of your posts`
  }
  else if (notification.notificationType === "reply") {
    text = `${userName} replied to one of your posts`
  }
  else if (notification.notificationType === "follow") {
    text = `${userName} followed you`
  }

  return text
}

function getNotificationUrl(notification) {
  let url
  let checkList = ["postLike", "retweet", "reply"]
  if (checkList.includes(notification.notificationType)) {
    url = `/posts/${notification.entityId}`
  }
  else if (notification.notificationType === "follow") {
    url = `/profile/${notification.entityId}`
  }

  return url
}