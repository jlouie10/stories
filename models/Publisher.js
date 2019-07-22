'use strict';

// Dependencies
const mongoose = require('mongoose');

// Mongoose Schema constructor reference
const Schema = mongoose.Schema;

// Define Publisher schema
const publisherSchema = new Schema({
    favicon: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    stories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Story'
        }
    ],
    website: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create Publisher model
const Pubisher = mongoose.model('Pubisher', publisherSchema);

module.exports = Pubisher;