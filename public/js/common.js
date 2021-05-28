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
        return button.addClass("active")
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
        return button.addClass("active")
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
  if (postData.postedBy._id === userLoggedIn._id) {
    button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
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