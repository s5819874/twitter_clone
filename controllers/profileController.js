const User = require('../models/userSchema')

const profileController = {
  profilePage: async (req, res) => {

    //瀏覽別人profile
    if (req.params.username) {
      const user = await User.findOne({ username: req.params.username })

      //檢查url中的username是否存在
      if (!user) {
        const payload = {
          pageTitle: 'User not found',
          userLoggedIn: req.user,
          userLoggedInJs: JSON.stringify(req.user),
        }
        return res.status(200).render('profile', payload)
      }
      //username存在
      const payload = {
        pageTitle: user.username,
        userLoggedIn: req.user,
        userLoggedInJs: JSON.stringify(req.user),
        profileUser: user
      }
      return res.status(200).render('profile', payload)
    }

    //瀏覽自己profile
    const payload = {
      pageTitle: req.user.username,
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      profileUser: req.user
    }

    return res.status(200).render('profile', payload)
  }
}

module.exports = profileController