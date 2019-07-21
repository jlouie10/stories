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

                    results = results.reverse(); // Order results chronologically, in ascending order

                    if (results.length === 0) {
                        res.status(200).json({ message: 'No new stories' });
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

    // GET route for scraping multiple websites, v3
    app.get('/api/v3/scrape', function (req, res) {
        axios.all([
            axios.get('https://chicago.eater.com/'),
            axios.get('https://techcrunch.com/'),
            axios.get('https://www.theringer.com/')
        ]).then(axios.spread(function (eater, tc, espn) {
            const response = [eater, tc, espn];
            const results = [];
            const $ = response.map(publisher => cheerio.load(publisher.data))

            $[0]('h2.c-entry-box--compact__title').each(function (i, element) {
                results.push({
                    title: $[0](element).children('a').text().trim(),
                    link: $[0](element).children('a').attr('href').trim()
                });
            });

            $[1]('.post-block--unread').each(function (i, element) { // Unable to target <article>
                results.push({
                    title: $[1](element).find('header h2 a').text().trim(),
                    link: $[1](element).find('header h2 a').attr('href').trim()
                });
            });

            $[2]('.c-compact-river__entry').each(function (i, element) {
                results.push({
                    title: $[2](element).find('h2 a').text().trim(),
                    link: $[2](element).find('h2 a').attr('href').trim(),
                    summary: $[2](element).find('p.p-dek.c-entry-box--compact__dek').text().trim()
                });
            });

            db.Story.find({})
                .then(function (dbStory) {
                    const existingLinks = dbStory.map(story => story.link);
                    const scrapedLinks = results.map(story => story.link);
                    let resultsFiltered = [];

                    scrapedLinks.forEach((item, index, arr) => {
                        if (!existingLinks.includes(item)) {
                            resultsFiltered.push(results[index]);
                        }
                    });

                    resultsFiltered = resultsFiltered.reverse();// Order results chronologically, in ascending order

                    if (resultsFiltered.length === 0) {
                        res.status(200).json({ message: 'No new articles' });
                    } else {
                        db.Story.create(resultsFiltered)
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
        }));
    });
};