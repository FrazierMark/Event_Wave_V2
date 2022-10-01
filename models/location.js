const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const noteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    username: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});


const locationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    location_description: {
        type: String,
        required: true,
        unique: true
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    zoom: {
        type: Number,
        required: true,
    },
    notes: [noteSchema]

}, {
    timestamps: true
});
module.exports = mongoose.model('Location', locationSchema);