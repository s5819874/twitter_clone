const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const User = require('../models/userSchema')

module.exports = app => {
  // 初始化 Passport 模組
  app.use(passport.initialize())
  app.use(passport.session())
  // 設定本地登入策略
  passport.use(new LocalStrategy(
    (username, password, done) => {
      User.findOne({
        //可以使用username or email登入
        $or: [
          { username: username },
          { email: username }
        ]
      })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'Not registered!' })
          }
          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Username/Email or Password incorrect.' })
          }
          return done(null, user)
        })
        .catch(err => done(err, false))
    }))
  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}