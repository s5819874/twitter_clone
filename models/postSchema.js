const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  content: { type: String, trim: true },
  postedBy: { type: Schema.Types.ObjectId, ref: "User" }, //ref model 用單引號!!
  pinned: Boolean
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)