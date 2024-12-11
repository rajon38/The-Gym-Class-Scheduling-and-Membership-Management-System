const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'role', required: true },
},
{timestamps: true, versionKey: false}
);

module.exports = mongoose.model('user',UsersSchema);