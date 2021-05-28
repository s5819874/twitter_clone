const User = require('../models/userSchema')

const profileController = {
  profilePage: async (req, res) => {

    //瀏覽別人profile
    if (req.params.username) {
      let user = await User.findOne({ username: req.params.username })
        .catch(err => console.log(err))
      if (!user) {
        let user = await User.findById(req.params.username)
          .catch(err => console.log(err))
      }

      //檢查url中的username/id是否存在
      if (!user) {
        const payload = {
          pageTitle: 'User not found',
          userLoggedIn: req.user,
          userLoggedInJs: JSON.stringify(req.user),
        }
        return res.status(200).render('profile', payload)

      }
      //username/id存在
      let payload = {
        pageTitle: user.username,
        userLoggedIn: req.user,
        userLoggedInJs: JSON.stringify(req.user),
        profileUser: user
      }
      if (req.url.match(/.*replies$/)) {
        payload.selectedTab = "replies"
      }
      if (req.url.match(/.*following$/)) {
        payload.selectedTab = "following"
        return res.status(200).render('followship', payload)
      }
      if (req.url.match(/.*followers$/)) {
        payload.selectedTab = "followers"
        return res.status(200).render('followship', payload)
      }

      return res.status(200).render('profile', payload)
    }

    //瀏覽自己profile
    let payload = {
      pageTitle: req.user.username,
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      profileUser: req.user
    }

    return res.status(200).render('profile', payload)
  }
}

module.exports = profileController