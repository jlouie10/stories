'use strict';

// Dependencies
const mongoose = require('mongoose');

// Mongoose Schema constructor reference
const Schema = mongoose.Schema;

// Define Comment schema
const commentSchema = new Schema({
    author: {
        type: String,
        default: 'Anonymous',
        required: true
    },
    story: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

// Create Comment model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;