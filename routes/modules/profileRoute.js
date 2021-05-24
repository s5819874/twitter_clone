const express = require('express')
const router = express.Router()

const profileController = require('../../controllers/profileController')

router.get('/', profileController.profilePage)
router.get('/:username', profileController.profilePage)

module.exports = router