const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

// MongoDB
const db = process.env.MONGODB_URL || 'mongodb://localhost:27017/valt-pass';
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log(error));

const app = express();
const port = process.env.PORT;

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes/index'));

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});url