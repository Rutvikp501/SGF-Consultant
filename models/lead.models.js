const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  consultant_code: {  type: String, required: true },
  leadID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  eventSpecialsName: { type: String,  },
  specialCode: { type: String, },
  leadType: { type: String, required: true },
  cycle:  {
    label: { type: String },
    number: { type: Number },
    year: { type: String }
  },  
  events: [{
    name: { type: String },
    date: { type: Date },
    timing: { type: String }
  }],
  packages :  {
    name: { type: String , default: ''},
    subname: { type: String , default: ''},
    addonS:  [{ type: String , default: ''}],
    amount: { type: Number , default: ''}
  },  
  bitrixres :  {
    status: { type: String , default: ''},
    message: { type: String , default: ''},
  },  
  booking :  {
    status: { type: String , default: ''},
    package:{ type: String , default: ''},
    discountprec:{ type: Number , default: null},
  },  
  conversionDate: { type: Date ,default: null},
  status: { type: String, enum: ['Pending', 'Converted', 'Junk'], default: 'Pending' },  
}, { timestamps: true });

const LeadModel = mongoose.model('lead', leadSchema);

module.exports = LeadModel;
