'use strict';

// Dependencies
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for scraping website
    app.get('/api/scrape', function (req, res) {
        axios.get('https://chicago.eater.com/').then(function (response) {
            const $ = cheerio.load(response.data);

            $('h2.c-entry-box--compact__title').each(function (i, element) {
                const result = {
                    title: $(element).children('a').text().trim(),
                    link: $(element).children('a').attr('href').trim()
                };

                db.Story.create(result)
                    .catch(function (err) {
                        console.log(err);
                    });
            });

            res.status(200).json({ message: 'Scrape complete' });
        });
    });
};