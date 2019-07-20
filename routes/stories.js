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

    // GET route for retrieving a story by id
    app.get('/api/stories/:_id', function (req, res) {
        db.Story.find({ _id: req.params._id })
            .populate('comments')
            .then(function (dbStory) {
                res.status(200).json(dbStory);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });

    // POST route for updating a story
    app.post('/api/stories/:_id', function (req, res) {
        db.Story.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true })
            .populate('comments')
            .then(function (dbStory) {
                res.status(200).json(dbStory);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });
};