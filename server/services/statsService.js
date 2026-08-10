const mongoose = require('mongoose');
const Note = require('../models/Note');

// Aggregation-based account statistics for the Profile/Settings page
const getUserStats = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totals] = await Note.aggregate([
    { $match: { userId: uid, isTrashed: false } },
    {
      $group: {
        _id: null,
        totalNotes: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        pinnedCount: { $sum: { $cond: ['$isPinned', 1, 0] } },
        archivedCount: { $sum: { $cond: ['$isArchived', 1, 0] } },
      },
    },
  ]);

  const notesThisMonth = await Note.countDocuments({
    userId: uid,
    isTrashed: false,
    createdAt: { $gte: startOfMonth },
  });

  const byColor = await Note.aggregate([
    { $match: { userId: uid, isTrashed: false } },
    { $group: { _id: '$color', count: { $sum: 1 } } },
  ]);

  return {
    totalNotes: totals?.totalNotes || 0,
    totalWords: totals?.totalWords || 0,
    pinnedCount: totals?.pinnedCount || 0,
    archivedCount: totals?.archivedCount || 0,
    notesThisMonth,
    byColor,
  };
};

module.exports = { getUserStats };
