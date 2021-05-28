$(document).ready(() => {

  if (selectedTab === "following") {
    loadFollowing()
  } else {
    loadFollowers()
  }
})

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, users => {
    outputUsers(users.following, $(".usersContainer"))
  })
}

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, users => {
    outputUsers(users.followers, $(".usersContainer"))
  })
}

function outputUsers(userlist, container) {
  container.html("")

  userlist.forEach(user => {
    let html = createUserHtml(user)
    container.append(html)
  })

  if (userlist.length === 0) {
    container.append("<span class='noResults'> No results found! </span>")
  }
}

function createUserHtml(user) {

  const displayName = user.firstName + " " + user.lastName

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
            
          </div>`
}

