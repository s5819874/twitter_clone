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
                      <button class='${buttonClass}' data-id='${user._id}'>${text}</button>
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

