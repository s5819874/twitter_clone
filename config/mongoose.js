const mongoose = require('mongoose')
const URI = 'mongodb+srv://root:rootroot@twitterclonecluster.qimdf.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority'

//'mongodb://localhost/TwitterClone'

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

const db = mongoose.connection
db.on('error', () => {
  console.log('mongoDB error!')
})
db.once('open', () => {
  console.log('mongoDB connected!')
})

module.exports = db