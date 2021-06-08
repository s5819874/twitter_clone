
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
  }

}

module.exports = messageController