const express = require('express')
const router = express.Router()
const passport = require('passport')

const userRoute = require('./modules/userRoute')
const authenticator = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/users/login')
}

router.use('/users', userRoute)
router.get('/', authenticator, (req, res, next) => {
  console.log(req.user)
  const payload = {
    pageTitle: 'Home',
    userLoggedIn: req.user
  }
  res.status(200).render('home', payload)
})


module.exports = router
