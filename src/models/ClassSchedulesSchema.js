const mongoose = require("mongoose");

const ClassSchedulesSchema = new mongoose.Schema({
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'class', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, 
    trainees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], 
},
{timestamps: true, versionKey: false}
);

module.exports = mongoose.model('classSchedule',ClassSchedulesSchema);