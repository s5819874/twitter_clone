$("#postTextarea").keyup(event => {
  let textBox = $(event.target)
  let value = textBox.val().trim()
  let submitButton = $("#submitPostButton")

  //確認按鈕存在
  if (submitButton.length === 0) return alert("No submit button found")
  //確認textbox有輸入
  if (value === "") return submitButton.prop("disabled", true)

  submitButton.prop("disabled", false)
})

$("#submitPostButton").click(event => {
  let textBox = $("#postTextarea")
  let submitButton = $(event.target)

  let data = {
    content: textBox.val()
  }

  $.post('/api/posts', data, postData => {
    let html = createPostHtml(postData)
    $(".postsContainer").prepend(html)
    textBox.val("")
    submitButton.prop("disabled", true)

    if ($(".noResults")) $(".noResults").remove()
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

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post")
  const rootElement = isRoot ? element : element.closest(".post")
  const postId = rootElement.data().id

  if (!postId) return alert("Post id undefine!")
  return postId
}

function createPostHtml(postData) {

  const displayName = postData.postedBy.firstName + " " + postData.postedBy.lastName
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""

  return `<div class='post' data-id='${postData._id}'>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
              <img src=${postData.postedBy.profilePic}>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${postData.postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postData.postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                </div>
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button>
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer'>
                    <button>
                      <i class='fas fa-retweet'></i>
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