const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
  message: { type: String, required: true },
  details:{type:String },
  comment:{type:String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
