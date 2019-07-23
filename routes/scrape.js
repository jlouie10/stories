'use strict';

// Dependencies
const axios = require('axios');
const cheerio = require('cheerio');

// Require all models
const db = require('../models');

// Routes
module.exports = function (app) {
    // GET route for scraping multiple websites, v4
    app.get('/api/v4/scrape', function (req, res) {
        // Fetch all publishers
        db.Publisher.find({})
            .then(function (dbPublisher) {
                const batch = dbPublisher.map(publisher => axios.get(publisher.website));

                // Make an axios batch request to all publisher websites
                axios.all(batch)
                    .then(function (response) {
                        const results = [];

                        response.forEach((item, index, arr) => {
                            const $ = cheerio.load(item.data);
                            const publisher = dbPublisher[index];

                            $(publisher.scrapeConfigs.selector).each(function (i, element) {
                                // Blacklist https://www.voxmedia.com/careers and http://www.voxmedia.com/careers
                                if (($(this).find('h2 a').attr('href').trim() !== 'https://www.voxmedia.com/careers') &&
                                    ($(this).find('h2 a').attr('href').trim() !== 'http://www.voxmedia.com/careers')) {
                                    results.push({
                                        publisher: publisher._id,
                                        title: $(this).find('h2 a').text().trim(),
                                        link: $(this).find('h2 a').attr('href').trim()
                                    });
                                }
                            });
                        })

                        // Fetch all stories and filter duplicates
                        db.Story.find({})
                            .then(function (dbStory) {
                                const scrapedLinks = results.map(story => story.link);
                                const existingLinks = dbStory.map(story => story.link);
                                let resultsFiltered = [];

                                scrapedLinks.forEach((item, index, arr) => {
                                    if (!existingLinks.includes(item)) {
                                        resultsFiltered.push(results[index]);
                                    }
                                });

                                resultsFiltered = resultsFiltered.reverse(); // Order results chronologically, in ascending order

                                if (resultsFiltered.length === 0) {
                                    res.status(200).json({ message: 'No new stories' });
                                } else {
                                    db.Story.create(resultsFiltered, { sort: { _id: -1 } })
                                        .then(function (dbStory) {
                                            res.status(200).json(dbStory);

                                            // Push new story _id into each publisher
                                            dbStory.forEach(story => {
                                                db.Publisher.findOneAndUpdate({ _id: story.publisher }, { $push: { stories: story._id } }, { new: true })
                                                    .catch(function (err) {
                                                        console.log(err);
                                                    });
                                            });
                                        })
                                        .catch(function (err) {
                                            res.status(500).json(err);
                                        });
                                }
                            })
                            .catch(function (err) {
                                res.status(500).json(err);
                            });
                    });
            })
            .catch(function (err) {
                res.status(500).json(err);
            });
    });

    // GET route for scraping multiple websites, v3
    app.get('/api/v3/scrape', function (req, res) {
        // Make an axios batch request to all publisher websites
        axios.all([
            axios.get('https://chicago.eater.com/'),
            axios.get('https://techcrunch.com/'),
            axios.get('https://www.theringer.com/')
        ]).then(axios.spread(function (eater, tc, ringer) {
            const response = [eater, tc, ringer];
            const results = [];
            const $ = response.map(publisher => cheerio.load(publisher.data));

            $[0]('.c-entry-box--compact').each(function (i, element) {
                results.push({
                    publisher: 'deprecated',
                    title: $(this).find('h2 a').text().trim(),
                    link: $(this).find('h2 a').attr().trim()
                });
            });

            $[1]('.post-block.post-block--image.post-block--unread').each(function (i, element) { // Unable to target <article>
                results.push({
                    publisher: 'deprecated',
                    title: $(this).find('h2 a').text().trim(),
                    link: $(this).find('h2 a').attr().trim()
                });
            });

            $[2]('.c-entry-box--compact').each(function (i, element) {
                results.push({
                    publisher: 'deprecated',
                    title: $(this).find('h2 a').text().trim(),
                    link: $(this).find('h2 a').attr().trim(),
                    summary: $[2](element).find('.p-dek.c-entry-box--compact__dek').text().trim()
                });
            });

            // Fetch all stories and filter duplicates
            db.Story.find({})
                .then(function (dbStory) {
                    const scrapedLinks = results.map(story => story.link);
                    const existingLinks = dbStory.map(story => story.link);
                    let resultsFiltered = [];

                    scrapedLinks.forEach((item, index, arr) => {
                        if (!existingLinks.includes(item)) {
                            resultsFiltered.push(results[index]);
                        }
                    });

                    resultsFiltered = resultsFiltered.reverse();// Order results chronologically, in ascending order

                    if (resultsFiltered.length === 0) {
                        res.status(200).json({ message: 'No new stories' });
                    } else {
                        db.Story.create(resultsFiltered, { sort: { _id: -1 } })
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

    // GET route for scraping website, v1
    app.get('/api/v1/scrape', function (req, res) {
        axios.get('https://chicago.eater.com/').then(function (response) {
            const $ = cheerio.load(response.data);

            $('h2.c-entry-box--compact__title').each(function (i, element) {
                const result = {
                    publisher: 'deprecated',
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