const Category = require('../models/Category');
const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;

  const exists = await Category.findOne({ userId: req.user._id, name });
  if (exists) throw new ApiError(409, 'A category with this name already exists');

  const category = await Category.create({ name, color, icon, userId: req.user._id });
  res.status(201).json(new ApiResponse(201, { category }, 'Category created'));
});

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { categories }));
});

// PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const { name, color, icon } = req.body;

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { name, color, icon } },
    { new: true, runValidators: true }
  );

  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json(new ApiResponse(200, { category }, 'Category updated'));
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!category) throw new ApiError(404, 'Category not found');

  // Detach notes rather than deleting them
  await Note.updateMany({ category: category._id }, { $set: { category: null } });

  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});

// GET /api/categories/:id/notes
const getCategoryNotes = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
  if (!category) throw new ApiError(404, 'Category not found');

  const notes = await Note.find({
    category: category._id,
    userId: req.user._id,
    isTrashed: false,
  }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { category, notes }));
});

module.exports = { createCategory, getCategories, updateCategory, deleteCategory, getCategoryNotes };
