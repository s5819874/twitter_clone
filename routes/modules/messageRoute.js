const express = require('express')
const router = express.Router()

const messageController = require('../../controllers/messageController')

router.get('/:chatId', messageController.chatPage)
router.get('/', messageController.inbox)
router.get('/new', messageController.newMessage)


module.exports = router