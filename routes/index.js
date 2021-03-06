const express = require('express')
const router = express.Router()
const passport = require('passport')

const userRoute = require('./modules/userRoute')
const postRoute = require('./modules/postRoute')
const profileRoute = require('./modules/profileRoute')
const searchRoute = require('./modules/searchRoute')
const messageRoute = require('./modules/messageRoute')
const notificationRoute = require('./modules/notificationRoute')
const uploadRoute = require('./modules/uploadRoute')
const apiRoute = require('./modules/apiRoute')




const authenticator = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/users/login')
}

router.use('/users', userRoute)
router.use('/posts', authenticator, postRoute)
router.use('/profile', authenticator, profileRoute)
router.use('/search', authenticator, searchRoute)
router.use('/messages', authenticator, messageRoute)
router.use('/notifications', authenticator, notificationRoute)
router.use('/uploads', authenticator, uploadRoute)
router.use('/api', authenticator, apiRoute)
router.get('/', authenticator, (req, res, next) => {
  const payload = {
    pageTitle: 'Home',
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  }

  res.status(200).render('home', payload)
})


module.exports = router
