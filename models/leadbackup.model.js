const mongoose = require('mongoose');

const quotation = new mongoose.Schema({
  number: { type: String,default: '' },
  name: { type: String,default: '' },
  stage: { type: String,default: ''},
  amount:{ type: Number,default: 0},
  commission:{ type: Number, default: null},
}, { _id: false });

const leadleadBackupSchema = new mongoose.Schema(
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
    location: { type: String },
    timing: { type: String }
  }],
  package: { 
    name: { type: String },
    subname: { type: String },
    addonS: [{ type: String }],
    amount: { type: Number }
  },
  bitrixres :  {
    status: { type: String , default: ''},
    leadno: { type: String , default: ''},
    message: { type: String , default: ''},
  },  
  quotation :  [quotation],
  stage:{ type: String ,default: ""},
  conversionDate: { type: Date ,default: null},
  status: { type: String, enum: ['Pending', 'Converted', 'Junk'], default: 'Pending' },  
}, { timestamps: true });


leadleadBackupSchema.pre('save', function(next) {
  // Only set commission in each quotation if it's not already set
  this.quotation.forEach((quote) => {
    if (quote.commission === null) {
      if (this.leadType === 'Seasonal') {
        quote.commission = 2; // 2%
      } else if (this.leadType === 'Regular') {
        quote.commission = 4; // 4%
      }
    }
  });
  next();
});

const LeadBackupModel = mongoose.model('leadbackup', leadleadBackupSchema);

module.exports = LeadBackupModel;
