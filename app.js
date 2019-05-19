const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

require('dotenv').config();

// MongoDB
const db = process.env.MONGODB_URL;
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log(error));

const app = express();
const port = process.env.PORT;

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes/index'));

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});