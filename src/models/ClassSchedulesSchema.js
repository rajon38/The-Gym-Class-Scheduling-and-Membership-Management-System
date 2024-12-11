const mongoose = require("mongoose");

const ClassSchedulesSchema = new mongoose.Schema({
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'class', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Example: "10:00 AM"
    endTime: { type: String, required: true },   // Example: "12:00 PM"
    trainees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Array of trainees
},
{timestamps: true, versionKey: false, validateBeforeSave: true,}
);

ClassSchedulesSchema.pre('validate', function (next) {
    if (this.trainees.length > 10) {
      next(new Error('Class schedule cannot have more than 10 trainees.'));
    } else {
      next();
    }
  });

module.exports = mongoose.model('classSchedule',ClassSchedulesSchema);