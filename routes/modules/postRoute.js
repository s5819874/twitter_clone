const express = require('express')
const router = express.Router()

const postController = require('../../controllers/postController')

router.get('/:id', postController.postPage)

module.exports = router