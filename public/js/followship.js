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



