const Post = require('../models/postSchema')

const postController = {
  postPage: (req, res) => {
    const payload = {
      pageTitle: 'view post',
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      postId: req.params.id
    }
    return res.status(200).render('postPage', payload)
  },
  postPageReplies: (req, res) => {
    const payload = {
      pageTitle: 'view post',
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      postId: req.params.id,
      selectedTab: "replies"
    }
    return res.status(200).render('postPage', payload)
  }
}

module.exports = postController