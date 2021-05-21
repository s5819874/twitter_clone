$(document).ready(() => {
  $.get("/api/posts", results => {
    outputPosts(results, $(".postsContainer"))
  })
})

function outputPosts(results, container) {

  if (results.length === 0) {
    return container.append("<span class='noResults'>Nothing to show.</span>") //網頁元素用append加入
  }

  container.html("")

  results.forEach(result => {
    let html = createPostHtml(result)
    container.append(html)
  })
}