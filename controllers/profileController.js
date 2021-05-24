const User = require('../models/userSchema')

const profileController = {
  profilePage: async (req, res) => {

    //瀏覽別人profile
    if (req.params.username) {
      const user = await User.findOne({
        $or: [
          { username: req.params.username },
          { _id: req.params.username }
        ]
      })
        .catch(err => console.log(err))

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