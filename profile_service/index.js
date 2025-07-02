const express = require('express');
const app = express();
const dotenv = require('dotenv');

app.use(express.json());
const db = require('./config/db');
const profileRouter = require('./routers/profileRouter');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

db();
const PORT = process.env.PORT || 3003;

app.use("/profiles", profileRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Profile service is running on port ${PORT}...`)
})