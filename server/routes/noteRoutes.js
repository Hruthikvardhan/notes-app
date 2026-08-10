const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
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
} = require('../controllers/noteController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

// Public route must be declared before protect middleware is applied globally below
router.get('/public', getPublicNotes);

router.use(protect);

router.post('/', [body('title').trim().notEmpty().withMessage('Title is required')], validate, createNote);
router.get('/', getNotes);
router.get('/search', searchNotes);
router.get('/pinned', getPinnedNotes);
router.get('/archived', getArchivedNotes);
router.get('/trash', getTrashedNotes);

router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', trashNote);
router.delete('/:id/permanent', deleteNotePermanently);

router.put('/:id/pin', togglePin);
router.put('/:id/archive', toggleArchive);
router.put('/:id/restore', restoreNote);
router.put('/:id/color', updateColor);
router.put('/:id/public', togglePublic);
router.post('/:id/image', upload.single('image'), addImage);
router.delete('/:id/image/:imageId', removeImage);
router.put('/:id/checklist/:itemId', toggleChecklistItem);

module.exports = router;
