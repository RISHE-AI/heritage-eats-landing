const Note = require('../models/Note');

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private/Admin
const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private/Admin
const createNote = async (req, res, next) => {
    try {
        const { title, content, category } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Please provide title and content' });
        }

        const note = await Note.create({ title, content, category });
        res.status(201).json({ success: true, data: note });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private/Admin
const updateNote = async (req, res, next) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        note = await Note.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private/Admin
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        await note.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote
};
