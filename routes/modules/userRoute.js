const express = require('express')
const router = express.Router()
const passport = require('passport')

const userController = require('../../controllers/userController')

router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login'
}), userController.login)
router.get('/logout', userController.logout)
router.get('/register', userController.registerPage)
router.post('/register', userController.register)

module.exports = router