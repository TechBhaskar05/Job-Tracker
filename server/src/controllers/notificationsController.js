import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id, read: false })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.status(200).json({ notifications });
});

export const getCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user.id, read: false });

  res.status(200).json({ count });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({ success: true });
});
