const bcrypt = require('bcrypt')

const User = require('../models/userSchema')

const userController = {
  loginPage: (req, res) => {
    return res.render('login')
  },
  login: (req, res) => {
    return res.redirect('/')
  },
  logout: (req, res) => {
    req.logout()
    return res.redirect('/users/login')
  },
  registerPage: (req, res) => {
    return res.render('register')
  },
  register: (req, res) => {
    const { firstName, lastName, username, email, password } = req.body
    const payload = req.body

    //檢查無空欄位
    if (!firstName || !lastName || !username || !email || !password) {
      payload.errorMessage = "Make sure each field has a valid value."
      return res.status(200).render('register', payload)
    }

    //檢查名稱信箱有無重複註冊
    User.findOne({
      $or: [
        { email },
        { username }
      ]
    })
      .then(user => {
        if (user) {
          if (email === user.email) {
            payload.errorMessage = "Email already in use."
          }
          payload.errorMessage = "Username already in use."
          return res.status(200).render('register', payload)
        }
        //創建使用者
        User.create({
          firstName, lastName, username, email,
          password: bcrypt.hashSync(password, 10)
        })
          .then(user => {
            return res.redirect('/')
          })
          .catch(err => console.log(err))

      })
      .catch(err => {
        console.log(err)
        payload.errorMessage = "Something went wrong."
        return res.status(200).render('register', payload)
      })
  },

}

module.exports = userController