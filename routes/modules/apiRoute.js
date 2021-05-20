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

module.exports = router