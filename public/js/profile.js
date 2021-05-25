$(document).ready(() => {
  if (selectedTab) {
    return loadReplies()
  }
  loadPosts()
})

function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}

function loadReplies() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}