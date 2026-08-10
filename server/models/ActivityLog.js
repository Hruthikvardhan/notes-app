const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: {
    type: String,
    enum: ['CREATED', 'UPDATED', 'DELETED', 'PINNED', 'ARCHIVED', 'RESTORED'],
    required: true,
  },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  noteTitle: { type: String },
  timestamp: { type: Date, default: Date.now },
});

activityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
