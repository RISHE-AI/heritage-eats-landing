const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a note title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add note content']
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
