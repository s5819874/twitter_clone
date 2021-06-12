const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content: { type: String, trim: true },
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  chat: { type: Schema.Types.ObjectId, ref: "Chat" }
}, { timestamps: true })

module.exports = mongoose.model('Message', MessageSchema)