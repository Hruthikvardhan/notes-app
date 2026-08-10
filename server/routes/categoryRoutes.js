const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryNotes,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

router.use(protect);

router.post('/', [body('name').trim().notEmpty().withMessage('Category name is required')], validate, createCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/:id/notes', getCategoryNotes);

module.exports = router;
