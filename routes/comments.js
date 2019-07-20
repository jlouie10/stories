'use strict';

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for listing all comments
    app.get('/api/comments', function (req, res) {
        db.Comment.find({})
            .then(function (dbComment) {
                res.status(200).json(dbComment);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });

    // GET route for retrieving a comment by id
    app.get('/api/comments/:_id', function (req, res) {
        db.Comment.find({ _id: req.params._id })
            .then(function (dbComment) {
                res.status(200).json(dbComment);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });

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


    // DELETE route for deleting a comment
    app.delete('/api/comments/:_id', function (req, res) {
        db.Comment.deleteOne({ _id: req.params._id })
            .then(function (dbComment) {
                res.status(200).json(dbComment);

                return db.Story.findOneAndUpdate({ _id: req.body.story }, { $pull: { comments: dbComment._id } }, { new: true });
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });
};