const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const upload = multer({ dest: "uploads/" })
const User = require('../../models/userSchema')
const Post = require('../../models/postSchema')
const Chat = require('../../models/chatSchema')
const Message = require('../../models/messageSchema')
const Notification = require('../../models/notificationSchema')


router.get("/users", async (req, res, next) => {
  var searchObj = req.query;

  if (req.query.search !== undefined) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { username: { $regex: req.query.search, $options: "i" } },
      ]
    }
  }

  User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    })
});

router.get('/posts', async (req, res) => {

  let searchObj = req.query

  if (searchObj.isReply !== undefined) {
    searchObj.replyTo = { $exists: searchObj.isReply == "true" }
    delete searchObj.isReply
  }

  if (searchObj.search !== undefined) {
    searchObj.content = { $regex: searchObj.search, $options: "i" }
    delete searchObj.search
  }

  //only showing following user's and userself's posts
  if (searchObj.followingOnly) {

    objectIds = req.user.following
    objectIds.push(req.user._id)

    searchObj.postedBy = { $in: objectIds }
    delete searchObj.followingOnly
  }

  const results = await getPosts(searchObj)
  return res.status(200).send(results)
})

router.get('/posts/:id', async (req, res) => {
  const postId = req.params.id
  let postData = await getPosts({ _id: postId })

  postData = postData[0]

  let results = {
    postData: postData
  }

  //如果前端點擊post為reply，找出original post
  if (postData.replyTo) {
    results.replyTo = postData.replyTo
  }

  //找出所有replies
  results.replies = await getPosts({ replyTo: postId })

  return res.status(200).send(results)
})

router.post('/posts', (req, res) => {
  //handle bad request
  if (!req.body.content) {
    console.log("Content param not sent with request")
    return res.sendStatus(400)
  }

  let postData = {
    content: req.body.content,
    postedBy: req.user // 給user, model自己找到Id
  }

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo
  }

  Post.create(postData)
    .then(async newPost => {
      newPost = await User.populate(newPost, { path: "postedBy" })
      newPost = await Post.populate(newPost, { path: "replyTo" })

      if (req.body.replyTo) {
        Notification.insertNotification(newPost.replyTo.postedBy, req.user, "reply", newPost._id)
      }

      return res.status(201).send(newPost)

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

  if (!isLiked) {
    Notification.insertNotification(postUpdated.postedBy, userId, "postLike", postId)
  }

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


  if (option === "$addToSet") {
    Notification.insertNotification(postUpdated.postedBy, userId, "retweet", postId)
  }

  return res.status(200).send(postUpdated)
})

router.delete('/posts/:id', async (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.put('/posts/:id', async (req, res) => {
  if (req.body.pinned !== undefined) {
    await Post.updateMany({ posted: req.user._id }, { pinned: false })
      .catch(err => {
        console.log(err)
        return res.sendStatus(400)
      })
  }

  await Post.findByIdAndUpdate(req.params.id, req.body)
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })

  return res.sendStatus(204)
})

router.put('/users/:userId/follow', async (req, res) => {
  const userId = req.params.userId
  const user = await User.findById(userId)
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })

  if (!user) return res.sendStatus(404)

  const isFollowing = user.followers && user.followers.includes(req.user._id)

  const option = isFollowing ? "$pull" : "$addToSet"

  req.user = await User.findByIdAndUpdate(req.user._id, { [option]: { "following": user._id } }, { new: true })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })

  User.findByIdAndUpdate(userId, { [option]: { "followers": req.user._id } })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })

  if (!isFollowing) {
    Notification.insertNotification(userId, req.user._id, "follow", req.user._id)
  }

  return res.status(200).send(req.user)
})

router.get('/users/:id/following', (req, res) => {
  User.findById(req.params.id)
    .populate("following")
    .then(users => {
      return res.status(200).send(users)
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    })
})

router.get('/users/:id/followers', (req, res) => {
  User.findById(req.params.id)
    .populate("followers")
    .then(users => {
      return res.status(200).send(users)
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    })
})

router.post('/users/profilePicture', upload.single("croppedImage"), (req, res) => {

  //檢查資料有無隨著ajax call傳來
  if (!req.file) {
    console.log("No file uploaded with ajax request.")
    return res.sendStatus(400)
  }

  const filePath = `/uploads/images/${req.file.filename}.png`
  const tempPath = req.file.path
  const targetPath = path.join(__dirname, `../../${filePath}`)

  fs.rename(tempPath, targetPath, async (err) => {
    if (err) {
      console.log(err)
      return res.sendStatus(400)
    }

    req.user = await User.findByIdAndUpdate(req.user._id, { profilePic: filePath }, { new: true })

    return res.sendStatus(200)
  })


})

router.post('/users/coverPhoto', upload.single("croppedImage"), (req, res) => {

  //檢查資料有無隨著ajax call傳來
  if (!req.file) {
    console.log("No file uploaded with ajax request.")
    return res.sendStatus(400)
  }

  const filePath = `/uploads/images/${req.file.filename}.png`
  const tempPath = req.file.path
  const targetPath = path.join(__dirname, `../../${filePath}`)

  fs.rename(tempPath, targetPath, async (err) => {
    if (err) {
      console.log(err)
      return res.sendStatus(400)
    }

    req.user = await User.findByIdAndUpdate(req.user._id, { coverPhoto: filePath }, { new: true })

    return res.sendStatus(200)
  })


})

router.post('/chats', (req, res) => {
  if (!req.body.users) {
    console.log("Users param not sent with request.")
    return res.sendStatus(400)
  }

  let users = JSON.parse(req.body.users)

  if (users.length === 0) {
    console.log("Users array is empty.")
    return res.sendStatus(400)
  }

  users.push(req.user)

  const chatData = {
    users,
    isGroupChat: true
  }

  Chat.create(chatData)
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.get('/chats', (req, res) => {
  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async results => {
      results = await User.populate(results, { path: "latestMessage.sender" })

      if (req.query.unreadOnly && req.query.unreadOnly === true) {
        results = results.filter(r => !r.latestMessage.readBy.includes(req.user._id))
      }

      res.status(200).send(results)
    })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.get('/chats/:chatId', (req, res) => {
  Chat.findOne({ _id: req.params.chatId, users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users")
    .then(chat => {
      res.status(200).send(chat)
    })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.put('/chats/:chatId', (req, res) => {
  Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then((chat) => {
      res.sendStatus(204)
    })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.post('/messages', (req, res) => {
  const { content, chatId } = req.body

  if (!content || !chatId) {
    console.log("Invalid data passed into request")
    return res.sendStatus(400)
  }

  const newMessage = {
    sender: req.user._id,
    chat: chatId,
    content,
  }

  Message.create(newMessage)
    .then(async (message) => {
      message = await message.populate("sender").execPopulate()
      message = await message.populate("chat").execPopulate()
      message = await User.populate(message, { path: "chat.users" })

      const chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message })
        .catch(err => {
          console.log(err)
          return res.sendStatus(400)
        })

      chat.users.forEach(userId => {
        if (userId === message.sender._id) return

        Notification.insertNotification(userId, message.sender._id, "newMessage", chat._id)
      })

      res.status(201).send(message)
    })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.get('/chats/:chatId/messages', (req, res) => {
  Message.find({ chat: req.params.chatId })
    .populate("sender")
    .then(messages => {
      res.status(200).send(messages)
    })
    .catch(err => {
      console.log(err)
      return res.sendStatus(400)
    })
})

router.get('/notifications', (req, res) => {
  let searchObject = { userTo: req.user._id, notificationType: { $ne: "newMessage" } }

  if (req.query.unreadOnly && req.query.unreadOnly === true) {
    searchObject.opened = false
  }

  Notification.find(searchObject)
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then(results => res.status(200).send(results))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

router.get('/notifications/latest', (req, res) => {

  Notification.findOne({ userTo: req.user._id })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 })
    .then(result => res.status(200).send(result))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

router.put('/notifications/:id/markedAsOpened', (req, res) => {
  Notification.findByIdAndUpdate(req.params.id, { opened: true })
    .then(() => res.sendStatus(204))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

router.put('/notifications/markedAsOpened', (req, res) => {
  Notification.updateMany({ userTo: req.user._id }, { opened: true })
    .then(() => res.sendStatus(204))
    .catch(err => {
      console.log(err)
      res.sendStatus(400)
    })
})

async function getPosts(filter) {
  let results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ "createdAt": -1 })
    .catch(err => console.log(err))

  results = await User.populate(results, { path: "retweetData.postedBy" })
  return await User.populate(results, { path: "replyTo.postedBy" })
}

module.exports = router