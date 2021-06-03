const path = require('path')

const uploadController = {
  profilePic: async (req, res) => {
    return res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`))
  }
}

module.exports = uploadController