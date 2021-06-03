const express = require('express')
const router = express.Router()

const uploadController = require('../../controllers/uploadController')

router.get('/images/:path', uploadController.profilePic)

module.exports = router