const express = require('express');
const app = express();
const profileRoute = require('./routes/ProfileRoute');
const apiRoute = require('./routes/apiRoute');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 8000;

app.use('/api/profiles', profileRoute);
app.use('/api', apiRoute);

app.listen(PORT, ()=> {
    console.log(`API gateway listening on port ${PORT}`);
})