const express = require('express')
const router = express.Router()

const User = require('../../models/userSchema')
const Post = require('../../models/postSchema')

router.get('/posts', (req, res) => {
  Post.find()
    .populate("postedBy")
    .sort({ "createdAt": -1 })
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

})

router.post('/posts', (req, res) => {
  //handle bad request
  if (!req.body.content) {
    console.log("Content param not sent with request")
    return res.sendStatus(400)
  }

  Post.create({
    content: req.body.content,
    postedBy: req.user // 給user, model自己找到Id
  })
    .then(post => {
      User.populate(post, { path: "postedBy" })
        .then(newpost => {
          return res.status(201).send(newpost)
        })
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

})

router.put('/posts/:id/like', async (req, res) => {
  const userId = req.user._id
  const postId = req.params.id

  req.user.likes = req.user.likes.map(o => o.toString())

  const isLiked = req.user.likes && req.user.likes.includes(postId)
  const option = isLiked ? "$pull" : "$addToSet"

  // insert to User
  req.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

  //insert to Post
  const postUpdated = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

  return res.status(200).send(postUpdated)
})

module.exports = router