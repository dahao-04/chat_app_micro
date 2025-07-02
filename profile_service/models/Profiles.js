const mongoose = require ('mongoose');

const profileSchema = new mongoose.Schema({
    _id: String, //userId
    name: String,
    avatarUrl: String,
    bio: String,
    gender: String,
    email: String,
    dob: String,
    location: String
});

module.exports = mongoose.model('profile', profileSchema);