'use strict';

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for listing all stories
    app.get('/api/stories', function (req, res) {
        db.Story.find({})
            .populate('comments')
            .then(function (dbStory) {
                res.status(200).json(dbStory);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });
};