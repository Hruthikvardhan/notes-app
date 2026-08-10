const User = require('../models/User');
const Note = require('../models/Note');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { getUserStats } = require('../services/statsService');

// GET /api/user/stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.user._id);
  res.status(200).json(new ApiResponse(200, { stats }));
});

// GET /api/user/activity
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.max(parseInt(req.query.limit) || 20, 1);
  const logs = await ActivityLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(limit);
  res.status(200).json(new ApiResponse(200, { logs }));
});

// PUT /api/user/preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { theme, defaultNoteColor } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { theme, defaultNoteColor } },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Preferences updated'));
});

// DELETE /api/user/account
const deleteAccount = asyncHandler(async (req, res) => {
  await Note.deleteMany({ userId: req.user._id });
  await ActivityLog.deleteMany({ userId: req.user._id });
  await User.findByIdAndDelete(req.user._id);

  res.clearCookie('refreshToken');
  res.status(200).json(new ApiResponse(200, null, 'Account and all associated data deleted'));
});

module.exports = { getStats, getActivity, updatePreferences, deleteAccount };
