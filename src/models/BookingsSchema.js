const mongoose = require("mongoose");

const BookingsSchema = new mongoose.Schema({
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'classSchedule', required: true },
    trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
},
{timestamps: true, versionKey: false}
);

module.exports = mongoose.model('booking', BookingsSchema);