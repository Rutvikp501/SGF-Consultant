const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
        Adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'advisers' },
        lead_name: { type: String, required: true },
        mobile_no: { type: Number, required: true },
        email_id: { type: String },
        plan: { type: String },
        desc: { type: String },
        associates: {
            associates_name: { type: String },
            associates_No: { type: Number }
        }
    }
);

const Lead = mongoose.model('lead', leadSchema);

module.exports = Lead;
