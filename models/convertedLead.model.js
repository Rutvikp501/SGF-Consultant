const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  paymentstatus: { type: String, required: true },
  totalamount: { type: String, required: true },
  percentage: { type: String, required: true },
  commission: { type: String, required: true },
}, { _id: false }); // Disable _id for subdocuments

const convertedLeadCycleSchema = new mongoose.Schema({
  label: { type: String },
  number: { type: Number },
  year: { type: String },
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  subname: { type: String, default: '' },
  addonS: [{ type: String, default: '' }],
  amount: { type: String, default: '' },
}, { _id: false });

const ConvertedleadSchema = new mongoose.Schema({
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  consultant_code: { type: String, required: true },
  leadID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  events: [{
    name: { type: String },
    date: { type: Date },
    location: { type: String },
    timing: { type: String }
  }],
  pincode: { type: String, required: true },
  eventSpecialsName: { type: String },
  specialCode: { type: String },
  leadType: { type: String, required: true },
  convertedLeadCycle: convertedLeadCycleSchema,
  packages: packageSchema,
  conversionDate: { type: Date, default: null },
  invoice: [invoiceSchema], // Array of invoice objects
}, { timestamps: true });

const ConvertedLeadModel = mongoose.model('converted_lead', ConvertedleadSchema);

module.exports = ConvertedLeadModel;
