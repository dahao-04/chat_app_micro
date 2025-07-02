const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const verifyApiKey = require('./verifyAPIKey');

const app = express();
const port = process.env.UPLOAD_PORT || 3002;
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(verifyApiKey);

//Avatar upload end-point
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ChatApp/uploads/avatar',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const uploadAvatar = multer({ storage: avatarStorage });

app.post('/upload/avatar', uploadAvatar.single('image'), (req, res) => {
    res.json({
        code: 200,
        data: {
            imageUrl: req.file.path
        }
    })
})

//Image upload end-point
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ChatApp/uploads/image',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const uploadImage = multer({ storage: imageStorage });

app.post('/upload/image', uploadImage.single('image'), (req, res) => {
    res.json({
        code: 200,
        data: {
            imageUrl: req.file.path
        }
    })
})

app.listen(port, () => {
    console.log(`Upload service is listening on port ${port}...`)
})