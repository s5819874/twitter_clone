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
  })
})

function createPostHtml(postData) {

  const displayName = postData.postedBy.firstName + " " + postData.postedBy.lastName

  return `<div class='post'>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
              <img src=${postData.postedBy.profilePic}>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${postData.postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postData.postedBy.username}</span>
                  <span class='date'>${postData.createdAt}</span>
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
                  <div class='postButtonContainer'>
                    <button>
                      <i class='far fa-heart'></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`
}