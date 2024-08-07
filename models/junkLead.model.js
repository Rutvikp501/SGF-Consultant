const mongoose = require('mongoose');

const JunkleadSchema = new mongoose.Schema(
    {
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  consultant_code: {  type: String, required: true },
  leadID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  pincode: { type: String, required: true },
  eventSpecialsName: { type: String,  },
  specialCode: { type: String, },
  leadType: { type: String, required: true },
  status: { type: String,  default: 'Junk'},  
  cycle:  {
    label: { type: String },
    number: { type: Number },
    year: { type: String }
},  
rejectionMark:{type:String},  
rejectionDate: { type: Date ,default: null},
}, { timestamps: true });

const JunkLeadModel = mongoose.model('junk_lead', JunkleadSchema);

module.exports = JunkLeadModel;
