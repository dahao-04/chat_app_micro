const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const cookieParser = require('cookie-parser');
const app = express();
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');
const verifyApiKey = require('./middleware/verifyAPIKey');
const userRoute = require('./routes/userRoute');
const groupRoute = require('./routes/groupRoute');
const messageRoute = require('./routes/messageRoute');
const conversationRoute = require('./routes/conversationRoute');
const stickerRoute = require('./routes/stickerRoute');
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());


db();

app.use(verifyApiKey);

app.use('/user', userRoute);
app.use('/group', groupRoute);
app.use('/mess', messageRoute);
app.use('/conversation', conversationRoute);
app.use('/sticker', stickerRoute);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
  });
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})