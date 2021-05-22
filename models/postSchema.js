const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  content: { type: String, trim: true },
  postedBy: { type: Schema.Types.ObjectId, ref: "User" }, //ref model 用單引號!!
  pinned: Boolean,
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  retweetUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  retweetData: { type: Schema.Types.ObjectId, ref: "Post" }, replyTo: { type: Schema.Types.ObjectId, ref: "Post" }
}, { timestamps: true })

module.exports = mongoose.model('Post', PostSchema)