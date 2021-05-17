const userController = {
  loginPage: (req, res) => {
    return res.render('login')
  },
  registerPage: (req, res) => {
    return res.render('register')
  }
}

module.exports = userController