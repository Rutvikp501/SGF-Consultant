const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
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
  status: { type: String, enum: ['Pending', 'Converted', 'Junk'], default: 'Pending' },  
  cycle:  {
    label: { type: String },
    number: { type: Number },
    year: { type: String }
},  
packages :  {
    name: { type: String , default: ''},
    subname: { type: String , default: ''},
    addonS:  [{ type: String , default: ''}],
    amount: { type: Number , default: ''}
},  
  conversionDate: { type: Date ,default: null},
}, { timestamps: true });

const LeadModel = mongoose.model('lead', leadSchema);

module.exports = LeadModel;
