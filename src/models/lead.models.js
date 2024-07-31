const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  leadID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  pincode: { type: String, required: true },
  eventSpecialsName: { type: String, required: true },
  specialCode: { type: String, required: true },
  leadType: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Converted', 'Junk'], default: 'Pending' },  
  cycle:  {
    label: { type: String },
    number: { type: Number }
},  
  conversionDate: { type: Date },
}, { timestamps: true });

const Lead = mongoose.model('lead', leadSchema);

module.exports = Lead;
