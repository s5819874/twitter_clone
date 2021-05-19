const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  content: { type: String, trim: true },
  postedby: { type: Schema.Types.ObjectId, ref: "User" },
  pinned: { type: Boolean }
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)