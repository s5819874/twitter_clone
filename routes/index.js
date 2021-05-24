const express = require('express')
const router = express.Router()
const passport = require('passport')

const userRoute = require('./modules/userRoute')
const postRoute = require('./modules/postRoute')
const profileRoute = require('./modules/profileRoute')
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
