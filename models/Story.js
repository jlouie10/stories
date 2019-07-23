'use strict';

// Dependencies
const mongoose = require('mongoose');

// Mongoose Schema constructor reference
const Schema = mongoose.Schema;

// Define Story schema
const storySchema = new Schema({
    bookmark: {
        type: Boolean,
        default: false,
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    link: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create Story model
const Story = mongoose.model('Story', storySchema);

module.exports = Story;