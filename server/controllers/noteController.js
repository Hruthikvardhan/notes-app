const Note = require('../models/Note');
const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getWordCount, getReadTime, stripMarkdown } = require('../utils/wordCounter');
const { uploadBuffer, deleteImage } = require('../services/cloudinaryService');

const logActivity = async (userId, action, note) => {
  await ActivityLog.create({
    userId,
    action,
    noteId: note._id,
    noteTitle: note.title,
  });
};

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 12, 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSort = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'az':
      return { title: 1 };
    case 'za':
      return { title: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

// POST /api/notes
const createNote = asyncHandler(async (req, res) => {
  const { title, content = '', noteType = 'TEXT', color, category, tags, checklistItems } = req.body;

  const contentText = stripMarkdown(content);
  const wordCount = getWordCount(content);
  const readTime = getReadTime(wordCount);

  const note = await Note.create({
    title,
    content,
    contentText,
    userId: req.user._id,
    color: color || req.user.defaultNoteColor,
    category: category || null,
    tags: tags || [],
    checklistItems: checklistItems || [],
    noteType,
    wordCount,
    readTime,
  });

  if (category) {
    await Category.findByIdAndUpdate(category, { $inc: { notesCount: 1 } });
  }

  await logActivity(req.user._id, 'CREATED', note);

  res.status(201).json(new ApiResponse(201, { note }, 'Note created'));
});

// GET /api/notes  (all non-trashed, non-archived notes with filters)
const getNotes = asyncHandler(async (req, res) => {
  const { category, tag, color, type, sort } = req.query;
  const { page, limit, skip } = buildPagination(req);

  const filter = { userId: req.user._id, isTrashed: false, isArchived: false };
  if (category) filter.category = category;
  if (tag) filter.tags = tag.toLowerCase();
  if (color) filter.color = color;
  if (type) filter.noteType = type;

  const [notes, total] = await Promise.all([
    Note.find(filter).sort(buildSort(sort)).skip(skip).limit(limit).populate('category', 'name color icon'),
    Note.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/notes/search?search=keyword
const searchNotes = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const { page, limit, skip } = buildPagination(req);

  if (!search.trim()) {
    throw new ApiError(400, 'Search query is required');
  }

  const filter = {
    userId: req.user._id,
    isTrashed: false,
    $text: { $search: search },
  };

  const [notes, total] = await Promise.all([
    Note.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Note.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      notes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
});

// GET /api/notes/pinned
const getPinnedNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({
    userId: req.user._id,
    isPinned: true,
    isTrashed: false,
    isArchived: false,
  }).sort({ pinnedAt: -1 });

  res.status(200).json(new ApiResponse(200, { notes }));
});

// GET /api/notes/archived
const getArchivedNotes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req);
  const filter = { userId: req.user._id, isArchived: true, isTrashed: false };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { notes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  );
});

// GET /api/notes/trash
const getTrashedNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ userId: req.user._id, isTrashed: true }).sort({ trashedAt: -1 });

  const RETENTION_DAYS = 30;
  const withDaysLeft = notes.map((n) => {
    const daysElapsed = (Date.now() - new Date(n.trashedAt).getTime()) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, Math.ceil(RETENTION_DAYS - daysElapsed));
    return { ...n.toObject(), daysRemaining };
  });

  res.status(200).json(new ApiResponse(200, { notes: withDaysLeft }));
});

// GET /api/notes/public  (no auth required)
const getPublicNotes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req);
  const filter = { isPublic: true, isTrashed: false };

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .select('-checklistItems -images.publicId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profilePic'),
    Note.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { notes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  );
});

// GET /api/notes/:id
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id }).populate(
    'category',
    'name color icon'
  );

  if (!note) throw new ApiError(404, 'Note not found');

  res.status(200).json(new ApiResponse(200, { note }));
});

// PUT /api/notes/:id
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const { title, content, color, category, tags, checklistItems, noteType, reminderDate } = req.body;

  if (title !== undefined) note.title = title;
  if (color !== undefined) note.color = color;
  if (tags !== undefined) note.tags = tags;
  if (checklistItems !== undefined) note.checklistItems = checklistItems;
  if (noteType !== undefined) note.noteType = noteType;
  if (reminderDate !== undefined) note.reminderDate = reminderDate;

  if (content !== undefined) {
    note.content = content;
    note.contentText = stripMarkdown(content);
    note.wordCount = getWordCount(content);
    note.readTime = getReadTime(note.wordCount);
  }

  if (category !== undefined && String(category) !== String(note.category)) {
    if (note.category) await Category.findByIdAndUpdate(note.category, { $inc: { notesCount: -1 } });
    if (category) await Category.findByIdAndUpdate(category, { $inc: { notesCount: 1 } });
    note.category = category || null;
  }

  await note.save();
  await logActivity(req.user._id, 'UPDATED', note);

  res.status(200).json(new ApiResponse(200, { note }, 'Note updated'));
});

// DELETE /api/notes/:id  (soft delete -> trash)
const trashNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isTrashed: true, trashedAt: new Date(), isPinned: false },
    { new: true }
  );

  if (!note) throw new ApiError(404, 'Note not found');

  await logActivity(req.user._id, 'DELETED', note);

  res.status(200).json(new ApiResponse(200, { note }, 'Note moved to trash'));
});

// DELETE /api/notes/:id/permanent
const deleteNotePermanently = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  await Promise.all(note.images.map((img) => deleteImage(img.publicId).catch(() => null)));

  if (note.category) {
    await Category.findByIdAndUpdate(note.category, { $inc: { notesCount: -1 } });
  }

  await note.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Note permanently deleted'));
});

// PUT /api/notes/:id/pin
const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  note.isPinned = !note.isPinned;
  note.pinnedAt = note.isPinned ? new Date() : null;
  await note.save();

  await logActivity(req.user._id, 'PINNED', note);

  res.status(200).json(new ApiResponse(200, { note }, note.isPinned ? 'Note pinned' : 'Note unpinned'));
});

// PUT /api/notes/:id/archive
const toggleArchive = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  note.isArchived = !note.isArchived;
  if (note.isArchived) note.isPinned = false;
  await note.save();

  await logActivity(req.user._id, 'ARCHIVED', note);

  res.status(200).json(new ApiResponse(200, { note }, note.isArchived ? 'Note archived' : 'Note unarchived'));
});

// PUT /api/notes/:id/restore
const restoreNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isTrashed: false, trashedAt: null },
    { new: true }
  );

  if (!note) throw new ApiError(404, 'Note not found');

  await logActivity(req.user._id, 'RESTORED', note);

  res.status(200).json(new ApiResponse(200, { note }, 'Note restored'));
});

// PUT /api/notes/:id/color
const updateColor = asyncHandler(async (req, res) => {
  const { color } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { color },
    { new: true }
  );

  if (!note) throw new ApiError(404, 'Note not found');

  res.status(200).json(new ApiResponse(200, { note }, 'Note color updated'));
});

// PUT /api/notes/:id/public
const togglePublic = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  note.isPublic = !note.isPublic;
  await note.save();

  res.status(200).json(new ApiResponse(200, { note }, note.isPublic ? 'Note made public' : 'Note made private'));
});

// POST /api/notes/:id/image
const addImage = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const result = await uploadBuffer(req.file.buffer, 'notes-app/notes');

  note.images.push({ url: result.secure_url, publicId: result.public_id, filename: req.file.originalname });
  if (note.noteType === 'TEXT' && note.images.length === 1) note.noteType = 'IMAGE';
  await note.save();

  res.status(201).json(new ApiResponse(201, { note }, 'Image added'));
});

// DELETE /api/notes/:id/image/:imageId
const removeImage = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const image = note.images.id(req.params.imageId);
  if (!image) throw new ApiError(404, 'Image not found on this note');

  await deleteImage(image.publicId).catch(() => null);
  image.deleteOne();
  await note.save();

  res.status(200).json(new ApiResponse(200, { note }, 'Image removed'));
});

// PUT /api/notes/:id/checklist/:itemId
const toggleChecklistItem = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, 'Note not found');

  const item = note.checklistItems.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Checklist item not found');

  item.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : !item.isCompleted;
  await note.save();

  res.status(200).json(new ApiResponse(200, { note }, 'Checklist item updated'));
});

module.exports = {
  createNote,
  getNotes,
  searchNotes,
  getPinnedNotes,
  getArchivedNotes,
  getTrashedNotes,
  getPublicNotes,
  getNoteById,
  updateNote,
  trashNote,
  deleteNotePermanently,
  togglePin,
  toggleArchive,
  restoreNote,
  updateColor,
  togglePublic,
  addImage,
  removeImage,
  toggleChecklistItem,
};
