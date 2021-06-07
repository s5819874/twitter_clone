let timer

$("#searchBox").keyup((event) => {
  clearTimeout(timer)

  const searchBox = $(event.target)
  const searchType = searchBox.data().search
  let value = searchBox.val()

  timer = setTimeout(() => {

    value = value.trim()

    if (value === "") {
      $(".usersContainer").html("")
    } else {
      search(value, searchType)
    }
  }, 1000)

})

function search(searchTerm, searchType) {
  const url = searchType === "users" ? "/api/users" : "/api/posts"

  $.get(url, { search: searchTerm }, results => {

    if (searchType === "users") {

      outputUsers(results, $(".usersContainer"))

    } else {
      outputPosts(results, $(".usersContainer"))
    }

  })
}