const mongoose = require("mongoose")
const Chat = require('../models/chatSchema')
const User = require('../models/userSchema')

const messageController = {

  inbox: (req, res) => {

    let payload = {
      pageTitle: "Inbox",
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
    }

    return res.status(200).render('inbox', payload)
  },

  newMessage: (req, res) => {

    let payload = {
      pageTitle: "New Message",
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
    }

    return res.status(200).render('newMessage', payload)
  },

  chatPage: async (req, res) => {

    const userId = req.user._id
    const chatId = req.params.chatId
    const isValidId = mongoose.isValidObjectId(chatId)

    let payload = {
      pageTitle: "Chat",
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
    }

    if (!isValidId) {
      payload.errMessage = "Chat does not exist or you have no permission to view it."
      return res.status(200).render('chatPage', payload)
    }

    let chat = await Chat.findOne({ users: { $elemMatch: { $eq: userId } }, _id: chatId })
      .populate("users")

    if (chat === null) {
      //check if user try to get chat by otheruser's id
      const userfound = await User.findById(chatId)

      if (userfound) {
        // get chat by userId, if chat does not exist then create one
        chat = await getChatByUserId(userId, userfound._id)
      }
    }

    if (chat === null) {
      payload.errMessage = "Chat does not exist or you have no permission to view it."
    } else {
      payload.chat = chat
    }

    return res.status(200).render('chatPage', payload)
  }

}

function getChatByUserId(userLoggedInID, otherUserID) {
  return chat = Chat.findOneAndUpdate({
    isGroupChat: false,
    users: {
      $size: 2,
      $all: [
        { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInID) } },
        { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserID) } }
      ]
    }
  }, {
    $setOnInsert: {
      users: [userLoggedInID, otherUserID]
    }
  }, {
    new: true,
    upsert: true
  })
    .populate("users")
}

module.exports = messageController