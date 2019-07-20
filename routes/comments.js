'use strict';

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // POST route for creating a comment and updating a story
    app.post('/api/comments', function (req, res) {
        db.Comment.create(req.body)
            .then(function (dbComment) {
                res.status(200).json(dbComment);

                return db.Story.findOneAndUpdate({ _id: req.body.story }, { $push: { comments: dbComment._id } }, { new: true });
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });
};