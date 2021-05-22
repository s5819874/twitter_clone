const express = require('express')
const router = express.Router()

const User = require('../../models/userSchema')
const Post = require('../../models/postSchema')

router.get('/posts', async (req, res) => {
  const results = await getPosts({})
  return res.status(200).send(results)
})

router.get('/posts/:id', async (req, res) => {
  const postId = req.params.id
  let results = await getPosts({ _id: postId })

  results = results[0]
  return res.status(200).send(results)
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

router.post('/posts/:id/retweet', async (req, res) => {
  const userId = req.user._id
  const postId = req.params.id

  //unretweet post if deletePost returns true
  const deletePost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

  let rePost = deletePost
  const option = rePost ? "$pull" : "$addToSet"

  //retweet post
  if (!rePost) {
    rePost = await Post.create({ postedBy: userId, retweetData: postId })
      .catch(err => {
        console.log(err)
        res.sendStatus(400)
      })
  }

  // update User
  req.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: rePost._id } }, { new: true })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

  //update Post
  const postUpdated = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })

  return res.status(200).send(postUpdated)
})

async function getPosts(filter) {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .sort({ "createdAt": -1 })
    .catch(err => console.log(err))

  return await User.populate(results, { path: "retweetData.postedBy" })
}

module.exports = router