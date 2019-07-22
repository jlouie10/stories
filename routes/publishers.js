'use strict';

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
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