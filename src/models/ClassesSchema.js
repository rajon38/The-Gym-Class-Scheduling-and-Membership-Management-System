const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
},
{timestamps: true, versionKey: false}
);

module.exports = mongoose.model('class', ClassSchema);