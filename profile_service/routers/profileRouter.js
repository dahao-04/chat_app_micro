const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const Profile = require('../models/Profiles');
const upload = multer({dest: 'temp/'});

const verifyApiKey = require('../middlewares/verifyAPIKey');
const checkRole = require('../middlewares/checkRole.js');
const AppError = require('../exceptions/AppError.js');

dotenv.config();

const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const API_KEY = process.env.API_KEY;

router.get('/', verifyApiKey, checkRole(['admin']), async (req, res, next) => {
    const profiles = await Profile.find();
    if(!profiles) return res.status(404).json({code: 404, message: 'No profile was found.'});
    res.status(200).json({code: 200, data: profiles});
})

router.post('/', verifyApiKey, checkRole(['admin', 'user']), async (req, res, next) => {
    try {
        const accessToken = req.headers["auth-token"];
        if(!accessToken) return next(new AppError(401, "Missing access token."));
        const decodeAccessToken = jwt.verify(accessToken, SECRET_ACCESS_KEY);

        const user_email = decodeAccessToken.userEmail;
        const userId = decodeAccessToken.userId;

        const newProfile = new Profile({
            _id: userId,
            email: user_email
        })

        await newProfile.save();
        return res.status(200).json({code: 200, message: "Success."});
    } catch (error) {
        return next(new AppError(500, "External error."));
    }
})

router.get('/me', verifyApiKey, checkRole(['admin', 'user']), async (req, res, next) => {
    const profile = await Profile.findById(req.user.id);
    if(!profile) return res.status(404).json({code: 404, message: 'No profile was found.'});
    return res.status(200).json({code: 200, data: profile});
})

router.get('/:id', verifyApiKey, checkRole(['admin', 'user']), async (req, res, next) => {
    try {
        const userId = req.params.id;

        const findProfile = await Profile.findById(userId);
        if(!findProfile) return next(new AppError(404, "No profile was found."));

        return res.status(200).json({
            code: 200,
            data: findProfile
        })
    } catch (error) {
        return next(new AppError(500, "External error."));
    }
})

router.put('/:id', verifyApiKey, checkRole(['admin', 'user']), async (req, res, next) => {
    try {
        const userId = req.params.id;

        if(userId !== req.user.id) return res.status(403).json({code: 403, message: 'You can not update other profile.'});

        const findProfile = await Profile.findById(userId);
        if(!findProfile) return next(new AppError(404, "Profile not found."));

        const updated = await Profile.findByIdAndUpdate(
            userId,
            {
                firstName: req.body.firstName || findProfile.firstName,
                lastName: req.body.lastName ?? findProfile.lastName,
                bio: req.body.bio ?? findProfile.bio,
                gender: req.body.gender ?? findProfile.gender,
                dob: req.body.dob ?? findProfile.dob,
                location: req.body.location ?? findProfile.location,
            },
            { new: true }
        );

        if(!updated) return next(new AppError(500, "Can not update profile"));

        return res.status(200).json({
            code: 200,
            data: updated
        })
    } catch (error) {
        return next(new AppError(500, "External error."));
    }
})

router.post('/avatar', verifyApiKey, checkRole(['admin', 'user']), upload.single('image'), async (req, res, next) => {
    try {
        const file = req.file;
        const accessToken = jwt.decode(req.headers['auth-token']);
        if(!accessToken) return next(new AppError(401, "Missing access token."));

        const form = new FormData();
        form.append('image', fs.createReadStream(file.path));

        const response = await axios.post(
            `${UPLOAD_SERVICE_URL}/upload/avatar`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "x-internal-api-key": API_KEY
                }
            }
        )

        const avatarUrl = response.data.data.imageUrl;

        await Profile.findOneAndUpdate({_id: accessToken.userId}, {avatarUrl: avatarUrl}, {new: true});

        fs.unlinkSync(file.path);
        return res.status(200).json({code: 200, data: avatarUrl});

    } catch (error) {
        return next(new AppError(500, "External error."));
    }
})


module.exports = router;