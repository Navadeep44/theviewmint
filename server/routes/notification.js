const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/notifications
 * Get paginated notifications for authenticated user
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { recipient: req.user.id };
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  res.json({
    notifications,
    unreadCount,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
  });
}));

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', auth, asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
  if (!notif) return res.status(404).json({ error: 'Notification not found.' });
  res.json(notif);
}));

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', auth, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  res.json({ message: 'All notifications marked as read.' });
}));

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
  res.json({ message: 'Notification deleted.' });
}));

module.exports = router;
