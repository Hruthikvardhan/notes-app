const Note = require('../models/Note');

const TRASH_RETENTION_DAYS = 30;

// Permanently deletes notes that have sat in trash longer than the retention window.
// Call startTrashCleanup() once from server.js to run this on an interval.
const cleanupTrash = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS);

  const result = await Note.deleteMany({ isTrashed: true, trashedAt: { $lte: cutoff } });
  if (result.deletedCount > 0) {
    console.log(`Trash cleanup: permanently removed ${result.deletedCount} note(s)`);
  }
  return result.deletedCount;
};

const startTrashCleanup = () => {
  // Run once on boot, then once every 24 hours
  cleanupTrash().catch((err) => console.error('Trash cleanup error:', err.message));
  setInterval(() => {
    cleanupTrash().catch((err) => console.error('Trash cleanup error:', err.message));
  }, 24 * 60 * 60 * 1000);
};

module.exports = { cleanupTrash, startTrashCleanup };
