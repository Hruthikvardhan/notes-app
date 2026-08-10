const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: { type: String },
  },
  { _id: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    content: { type: String, default: '' },
    contentText: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    color: { type: String, default: '#FFFFFF' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: [{ type: String, trim: true, lowercase: true }],
    images: [imageSchema],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    reminderDate: { type: Date, default: null },
    checklistItems: [checklistItemSchema],
    noteType: { type: String, enum: ['TEXT', 'CHECKLIST', 'IMAGE'], default: 'TEXT' },
    wordCount: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    trashedAt: { type: Date, default: null },
    pinnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Text index for full-text search across title, content, and tags
noteSchema.index({ title: 'text', contentText: 'text', tags: 'text' });
noteSchema.index({ userId: 1, isTrashed: 1, isArchived: 1, isPinned: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
