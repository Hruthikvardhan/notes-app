const express = require('express');
const router = express.Router();

const { getStats, getActivity, updatePreferences, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getStats);
router.get('/activity', getActivity);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

module.exports = router;
