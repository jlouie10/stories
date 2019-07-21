'use strict';

// Dependencies
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for scraping website, v1
    app.get('/api/v1/scrape', function (req, res) {
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

    // GET route for scraping website, v2
    app.get('/api/v2/scrape', function (req, res) {
        axios.get('https://chicago.eater.com/').then(function (response) {
            const $ = cheerio.load(response.data);
            const results = [];

            $('h2.c-entry-box--compact__title').each(function (i, element) {
                results.push({
                    title: $(element).children('a').text().trim(),
                    link: $(element).children('a').attr('href').trim()
                });
            });

            db.Story.find({})
                .then(function (dbStory) {
                    const existingLinks = dbStory.map(story => story.link);
                    let results = [];

                    $('h2.c-entry-box--compact__title').each(function (i, element) {
                        const scrapedLink = $(element).children('a').attr('href').trim();

                        if (!existingLinks.includes(scrapedLink)) {
                            results.push({
                                title: $(element).children('a').text().trim(),
                                link: scrapedLink
                            });
                        }
                    });

                    results = results.reverse();// Order results chronologically, in ascending order

                    if (results.length === 0) {
                        res.status(200).json({ message: 'No new articles' });
                    } else {
                        db.Story.create(results)
                            .then(function (dbStory) {
                                res.status(200).json(dbStory);
                            })
                            .catch(function (err) {
                                res.status(500).send(err);
                            });
                    }
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        });
    });
};