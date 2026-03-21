const express = require('express');
const router = express.Router();
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All note routes are admin only
router.use(protect, adminOnly);

router.route('/')
    .get(getNotes)
    .post(createNote);

router.route('/:id')
    .put(updateNote)
    .delete(deleteNote);

module.exports = router;
