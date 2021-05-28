const express = require('express')
const router = express.Router()

const profileController = require('../../controllers/profileController')

router.get('/', profileController.profilePage)
router.get('/:username/replies', profileController.profilePage)
router.get('/:username', profileController.profilePage)
router.get('/:username/following', profileController.profilePage)
router.get('/:username/followers', profileController.profilePage)

module.exports = router