const express = require('express')
const router = express.Router()

const userRoute = require('./modules/userRoute')

router.use('/users', userRoute)
router.get('/', (req, res, next) => {
  const payload = {
    pagetitle: 'Home'
  }
  res.status(200).render('home', payload)
})


module.exports = router
