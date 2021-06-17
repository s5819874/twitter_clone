
const Chat = require('../models/chatSchema')
const User = require('../models/userSchema')

const notificationController = {

  notificationPage: (req, res) => {
    let payload = {
      pageTitle: "Notification",
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
    }

    return res.status(200).render('notification', payload)
  }
}

module.exports = notificationController