import mongoose from 'mongoose';

/**
 * @typedef {object} Notification
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user receiving the notification.
 * @property {mongoose.Schema.Types.ObjectId} [jobId] - The ID of the related job, if any.
 * @property {string} message - The notification message.
 * @property {boolean} read - Whether the notification has been read.
 * @property {Date} createdAt - The timestamp when the notification was created.
 */
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model('Notification', NotificationSchema);
