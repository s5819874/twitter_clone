const express = require('express')
const router = express.Router()

const searchController = require('../../controllers/searchController')

router.get('/', searchController.searchPage)
router.get('/:selectedTab', searchController.searchResults)


module.exports = router