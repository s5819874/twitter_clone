//globals
let cropper
let selectedUsers = []

$(document).ready(() => {
  refreshMessagesBadge()
  refreshNotificationsBadge()
})

$("#postTextarea, #replyTextarea").keyup(event => {
  let textBox = $(event.target)
  let value = textBox.val().trim()

  let isModal = textBox.parents(".modal").length

  let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton")

  //確認按鈕存在
  if (submitButton.length === 0) return alert("No submit button found")
  //確認textbox有輸入
  if (value === "") return submitButton.prop("disabled", true)

  submitButton.prop("disabled", false)
})

$("#submitPostButton, #submitReplyButton").click(event => {
  let submitButton = $(event.target)

  let isModal = submitButton.parents(".modal").length

  textBox = isModal ? $("#replyTextarea") : $("#postTextarea")

  let data = {
    content: textBox.val()
  }

  if (isModal) {
    const id = submitButton.data().id
    if (id === null) alert("Button's data.id is null!")
    data.replyTo = id
  }

  $.post('/api/posts', data, postData => {

    if (postData.replyTo) {
      emitNotification(postData.replyTo.postedBy)
      location.reload()
    } else {
      let html = createPostHtml(postData)
      $(".postsContainer").prepend(html)
      textBox.val("")
      submitButton.prop("disabled", true)

      if ($(".noResults")) $(".noResults").remove()
    }
  })
})

// when reply modal pops up
$("#replyModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)

  $("#submitReplyButton").data("id", postId)

  $.get("/api/posts/" + postId, results => {
    outputPosts(results.postData, $("#originalPostContainer"))
  })

})

// when reply modal hiddens 
$("#replyModal").on("hidden.bs.modal", event => {
  $("#originalPostContainer").html("")
})

// when delete modal opens
$("#deletePostModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)

  $("#deletePostButton").data("id", postId)
})


$("#deletePostButton").click(event => {
  const postId = $(event.target).data("id")

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: (data, status, xhr) => {
      if (xhr.status !== 202) {
        alert("Could not delete!")
        return
      }
      return location.reload()
    }
  })
})

// when pin post modal opens
$("#pinPostModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)

  $("#pinPostButton").data("id", postId)
})

$("#pinPostButton").click(event => {
  const postId = $(event.target).data("id")

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        alert("Could not pin!")
        return
      }
      return location.reload()
    }
  })
})

// when unpin post modal opens
$("#unpinPostModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)

  $("#unpinPostButton").data("id", postId)
})

$("#unpinPostModal").click(event => {
  const postId = $(event.target).data("id")

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: false },
    success: (data, status, xhr) => {
      if (xhr.status !== 204) {
        alert("Could not unpin!")
        return
      }
      return location.reload()
    }
  })
})

//search users for chatting
$("#userSearchTextbox").keyup((event) => {

  let textbox = $(event.target)
  let value = textbox.val()

  if (value === "" && (event.which === 8 || event.keyCode === 8)) {

    //remove the latest element
    selectedUsers.pop()
    //update selected users html
    updateSelectedUserHtml()
    $(".usersContainer").html("")

    if (selectedUsers.length === 0) $("#createChatButton").prop("disabled", true)

    return
  }

  setTimeout(() => {
    value = value.trim()
    if (value === "") {
      $(".usersContainer").html("")
    } else {
      searchUser(value)
    }
  }, 1000)

})

//create chat
$("#createChatButton").click(() => {
  const users = JSON.stringify(selectedUsers)

  $.post("/api/chats", { users }, chat => {

    if (!chat || !chat._id) return alert("No chat returned from the server.")

    window.location.href = `/messages/${chat._id}`

  })

})

//image upload preview
$("#filePhoto").change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      let image = document.getElementById("imagePreview")
      image.src = e.target.result

      if (cropper !== undefined) cropper.destroy()

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false

      })
    }
    reader.readAsDataURL(this.files[0])
  }
})

//image upload
$("#imageUploadButton").click(() => {
  let canvas = cropper.getCroppedCanvas()

  if (canvas === null) {
    alert("Counld not upload file, is it a image file?")
    return
  }

  //把截圖的部分轉成blob資料型式，放進formData中透過ajax call傳至server
  canvas.toBlob(blob => {
    let formData = new FormData()
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      data: formData,
      processData: false, //不要轉成JSON
      contentType: false,
      success: () => location.reload()
    })
  })
})

//cover photo upload preview
$("#coverPhoto").change(function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      let image = document.getElementById("coverPreview")
      image.src = e.target.result

      if (cropper !== undefined) cropper.destroy()

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false

      })
    }
    reader.readAsDataURL(this.files[0])
  }
})

//cover photo upload
$("#coverPhotoButton").click(() => {
  let canvas = cropper.getCroppedCanvas()

  if (canvas === null) {
    alert("Counld not upload file, is it a image file?")
    return
  }

  //把截圖的部分轉成blob資料型式，放進formData中透過ajax call傳至server
  canvas.toBlob(blob => {
    let formData = new FormData()
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false, //不要轉成JSON
      contentType: false,
      success: () => location.reload()
    })
  })
})

$(document).on("click", ".likeButton", event => {
  const button = $(event.target)
  const postId = getPostIdFromElement(button)

  if (!postId) return

  $.ajax({

    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {

      button.find("span").text(postData.likes.length || "")

      //postData.likes = postData.likes.map(o => o.toString())

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active")
        return emitNotification(postData.postedBy)
      }
      button.removeClass("active")

    }

  })
})

$(document).on("click", ".retweetButton", event => {
  const button = $(event.target)
  const postId = getPostIdFromElement(button)

  if (!postId) return

  $.ajax({

    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "")

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active")
        return emitNotification(postData.postedBy)
      }
      button.removeClass("active")

    }

  })
})

$(document).on("click", ".followButton", event => {
  let button = $(event.target)
  const userId = button.data().userid

  $.ajax({

    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        return alert("User not found")
      }

      let followerCountDisplay = $("#followerCount")
      let followerCount = parseInt(followerCountDisplay.text())

      if (data.following && data.following.includes(userId)) {
        button.addClass("following")
        button.text("Following")
        followerCountDisplay.text(`${followerCount + 1}`)
        emitNotification(userId)
      } else {
        button.removeClass("following")
        button.text("Follow")
        followerCountDisplay.text(`${followerCount - 1}`)
      }
    }
  })
})

$(document).on("click", ".post", event => {
  const element = $(event.target)
  const postId = getPostIdFromElement(element)

  if (postId && !element.is("button")) {
    //導向postPage
    window.location.href = "/posts/" + postId
  }
})

$(document).on("click", ".notification.active", event => {
  const container = $(event.target)
  const notificationId = container.data().id

  //先暫停連結
  const href = container.attr("href")
  event.preventDefault()

  console.log("here")
  const callback = () => window.location = href
  markNotificationAsOpened(notificationId, callback)
})

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post")
  const rootElement = isRoot ? element : element.closest(".post")
  const postId = rootElement.data().id

  if (!postId) return alert("Post id undefine!")
  return postId
}

function createPostHtml(postData, largeFont = false) {

  if (postData === null) alert("postData undefined!")

  const isRetweet = postData.retweetData !== undefined

  //retweetPost content
  postData = isRetweet ? postData.retweetData : postData
  const retweetedBy = isRetweet ? postData.postedBy.username : ""

  if (postData.postedBy === undefined) {
    return console.log("User object not populated");
  }

  const displayName = postData.postedBy.firstName + " " + postData.postedBy.lastName
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
  const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : ""

  let retweetText = ""
  if (isRetweet) {
    retweetText = `<span>
      <i class='fas fa-retweet'></i>
      Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
    </span>`
  }

  let replyFlag = ""
  if (postData.replyTo && postData.replyTo._id) {

    if (!postData.replyTo._id) {
      return alert("ReplyTo is not populated!")
    } else if (!postData.replyTo.postedBy._id) {
      return alert("ReplyTo.postedBy is not populated!")
    }

    const replyToUsername = postData.replyTo.postedBy.username

    replyFlag = `<div class='replyFlag'>
      Replying to <a herf='/profile/${replyToUsername}'>@${replyToUsername}</a>
      
    </div>`
  }

  let largeFontClass = largeFont ? "largeFont" : ""

  //delete button
  let button = ""
  let pinnedPostText = ""

  if (postData.postedBy._id === userLoggedIn._id) {

    let pinButtonClass = ""
    let targetModal = "#pinPostModal"
    if (postData.pinned === true) {
      pinButtonClass = "active"
      pinnedPostText = "<i class='fas fa-thumbtack'></i><span> Pinned post </span>"
      targetModal = "#unpinPostModal"
    }

    button = `<button class="pinButton ${pinButtonClass}" data-id="${postData._id}" data-toggle="modal" data-target="${targetModal}">
                <i class="fas fa-thumbtack"></i>
              </button >
              <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                <i class="fas fa-times"></i>
              </button >`
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='retweetInfoContainer'>
              ${retweetText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
              <img src=${postData.postedBy.profilePic}>
              </div>
              <div class='postContentContainer'>
                <div class='pinnedPostText'>${pinnedPostText}</div>
                <div class='header'>
                  <a href='/profile/${postData.postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postData.postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${button}
                </div>
                ${replyFlag}
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button data-toggle='modal' data-target='#replyModal'>
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='retweetButton ${retweetButtonActiveClass}'>
                      <i class='fas fa-retweet'></i>
                      <span>${postData.retweetUsers.length || ""}</span>
                    </button>
                  </div>
                  <div class='postButtonContainer red'>
                    <button class='likeButton ${likeButtonActiveClass}'>
                      <i class='far fa-heart'></i>
                      <span>${postData.likes.length || ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`
}

function outputPosts(results, container) {

  if (results.length === 0) {
    return container.append("<span class='noResults'>Nothing to show.</span>") //網頁元素用append加入
  }

  container.html("")

  if (!Array.isArray(results)) {
    results = [results]
  }

  results.forEach(result => {
    let html = createPostHtml(result)
    container.append(html)
  })
}

function outputPinnedPost(results, container) {

  if (results.length === 0) {
    return container.hide()
  }

  container.html("")

  results.forEach(result => {
    let html = createPostHtml(result)
    container.append(html)
  })
}

function outputPostsWithReplies(results, container) {

  container.html("")

  //如果點擊post是reply，並確保replyTo populated
  if (results.replyTo && results.replyTo._id) {
    let html = createPostHtml(results.replyTo)
    container.append(html)
  }

  let mainPostHtml = createPostHtml(results.postData, true)
  container.append(mainPostHtml)

  //show replies
  results.replies.forEach(reply => {
    let html = createPostHtml(reply)
    container.append(html)
  })
}

//以後改用moment.js
function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";

    return Math.round(elapsed / 1000) + ' seconds ago';
  }

  else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  }

  else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  }

  else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  }

  else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  }

  else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
}

function outputUsers(userlist, container) {
  container.html("")

  userlist.forEach(user => {
    let html = createUserHtml(user, true)
    container.append(html)
  })

  if (userlist.length === 0) {
    container.append("<span class='noResults'> No results found! </span>")
  }
}

function createUserHtml(user, showButton) {

  const displayName = user.firstName + " " + user.lastName
  const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(user._id)
  const text = isFollowing ? "Following" : "Follow"
  const buttonClass = isFollowing ? "followButton following" : "followButton"

  let followButton = ""
  if (showButton && userLoggedIn._id !== user._id) {
    followButton = `<div class='followButtonContainer'>
                      <button class='${buttonClass}' data-userid='${user._id}'>${text}</button>
                    </div>`
  }

  return `<div class='user'>

            <div class='userImageContainer'>
              <img src='${user.profilePic}'>
            </div>

            <div class='userDetailsContainer'>
              <div class='header'>
                <a href='/profile/${user.username}'>${displayName}</a>
                <span class='username'>@${user.username}</span>
              </div>
            </div>
            ${followButton}
          </div>`
}

function searchUser(searchTerm) {
  $.get("/api/users", { search: searchTerm }, results => {
    outputSelectableUsers(results, $(".usersContainer"))
  })
}

function outputSelectableUsers(userlist, container) {
  container.html("")

  userlist.forEach(user => {

    if (user._id === userLoggedIn._id || selectedUsers.some(u => u._id === user._id)) {
      return
    }

    let html = createUserHtml(user, false)
    let element = $(html)

    element.click(() => selectUser(user))

    container.append(element)
  })

  if (userlist.length === 0) {
    container.append("<span class='noResults'> No results found! </span>")
  }
}

function selectUser(user) {
  selectedUsers.push(user)
  updateSelectedUserHtml()
  $("#userSearchTextbox").val("").focus()
  $(".usersContainer").html("")
  $("#createChatButton").prop("disabled", false)
}

function updateSelectedUserHtml() {
  let elements = []
  selectedUsers.forEach(u => {
    const name = u.firstName + " " + u.lastName
    const userElement = `<span class='selectedUser'>${name}</span>`
    elements.push(userElement)

  })

  //每選擇一個user，selectedUserHtml要全部重新產生
  $(".selectedUser").remove()
  //prepend將新增元素放入第一個子元素之前
  $("#selectedUsers").prepend(elements)

}

function getChatName(chat) {
  let chatName = chat.chatName

  if (!chatName) {
    let otherUsers = getOtherUsers(chat.users)
    let otherUserNameList = otherUsers.map(u => u.firstName + " " + u.lastName)
    chatName = otherUserNameList.join(", ")
  }

  return chatName
}

function getOtherUsers(users) {
  if (users.length === 1) return users

  return users.filter(u => u._id !== userLoggedIn._id)
}

function messageReceived(newMessage) {
  if ($(".chatMessages").length === 0) {
    showMessagePopup(newMessage)
  } else {
    //in chat page
    addChatMessage(newMessage)
  }

  refreshMessagesBadge()
}

function markNotificationAsOpened(notificationId = null, callback = null) {
  if (!callback) callback = () => location.reload()

  const url = notificationId !== null ? `/api/notifications/${notificationId}/markedAsOpened` : "/api/notifications/markedAsOpened"

  $.ajax({
    url,
    type: "PUT",
    success: () => callback()
  })
}

function refreshMessagesBadge() {
  $.get("/api/chats", { unreadOnly: true }, data => {
    let number = data.length

    if (number > 0) {
      $("#messagesBadge").text(number).addClass("active")
    }
    else {
      $("#messagesBadge").text("").removeClass("active")
    }
  })
}

function refreshNotificationsBadge() {
  $.get("/api/notifications", { unreadOnly: true }, data => {
    let number = data.length

    if (number > 0) {
      $("#notificationsBadge").text(number).addClass("active")
    }
    else {
      $("#notificationsBadge").text("").removeClass("active")
    }
  })
}

function showNotificationPopup(notification) {
  const html = createNotificationHtml(notification)
  const element = $(html)
  element.hide().prependTo("#notificationList").slideDown("fast")

  setTimeout(() => {
    element.fadeOut(400)
  }, 5000)
}

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

function showMessagePopup(newMessage) {

  if (!newMessage.chat.latestMessage._id) {
    newMessage.chat.latestMessage = newMessage
  }

  const html = createChatHtml(newMessage.chat)
  const element = $(html)
  element.hide().prependTo("#notificationList").slideDown("fast")

  setTimeout(() => {
    element.fadeOut(400)
  }, 5000)
}

function createChatHtml(chat) {
  const chatName = getChatName(chat)
  const image = getChatImageElements(chat)
  const latestMessage = getLatestMessage(chat.latestMessage)

  return `<a href="/messages/${chat._id}" class="resultListItem">
              ${image}
              <div class="resultsDetailsContainer ellipsis">
                <span class="heading ellipsis"> ${chatName}</span>
                <span class="subtext ellipsis"> ${latestMessage}</span>
              </div>
          </a>`
}

function getLatestMessage(latestMessage) {
  if (latestMessage) {
    const sender = latestMessage.sender
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`
  }

  return "New chat"
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