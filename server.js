'use strict';

// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

// Initialize Express
const app = express();

// Define port
const PORT = process.env.PORT || 9000;

// MongoDB configuration
const config = require('./config/config')

// Serve static files
app.use(express.static(__dirname + '/public'));

// Set up Express to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars as the default template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });

// Routes
require('./routes/scrape')(app);

// Start server
app.listen(PORT);