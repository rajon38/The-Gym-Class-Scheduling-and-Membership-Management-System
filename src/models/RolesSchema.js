const mongoose = require("mongoose");

const RolesSchema = new mongoose.Schema({
    name: { type: String, required: true, enum: ['Admin', 'Trainer', 'Trainee'] },
},
{timestamps: true, versionKey: false}
);

module.exports = mongoose.model('role', RolesSchema);