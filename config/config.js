'use strict';

module.exports = {
    // If deployed, use the deployed database. Otherwise use the local storiesLocal database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1/storiesLocal'
};