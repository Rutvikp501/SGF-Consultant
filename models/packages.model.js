const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
    {
  type: {  type: String, },
  name: {  type: String, },
  subname: {  type: String, },
  retail_price: { type: String,},
  detailed_description: [{ type: String }],
}, { timestamps: true });

const packagesModel = mongoose.model('packages', packageSchema);

module.exports = packagesModel;