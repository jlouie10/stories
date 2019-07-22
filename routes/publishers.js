'use strict';

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for listing all publishers
    app.get('/api/publishers', function (req, res) {
        db.Publisher.find({})
            .populate({ path: 'stories', options: { sort: { _id: -1 } } })
            .sort({ _id: -1 })
            .then(function (dbPublisher) {
                res.status(200).json(dbPublisher);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });

    // POST route for creating a publisher
    app.post('/api/publishers', function (req, res) {
        db.Publisher.create(req.body)
            .then(function (dbPublisher) {
                res.status(200).json(dbPublisher);
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });
};