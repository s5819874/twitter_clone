const User = require('../models/userSchema')

const searchController = {
  searchPage: (req, res) => {

    let payload = creatPayloads(req.user)

    return res.status(200).render('searchPage', payload)
  },
  searchResults: (req, res) => {

    let payload = creatPayloads(req.user)

    payload.selectedTab = req.params.selectedTab

    return res.status(200).render('searchPage', payload)
  }
}

function creatPayloads(userLoggedIn) {
  return {
    pageTitle: "Search",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  }
}

module.exports = searchController