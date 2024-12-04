const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
  type: {  type: String, },
  name: {  type: String, },
  subname: {  type: String, },
  detailed_description: { type: String },
  retail_price: { type: String,},
  PhotoUrl: { type: String, default: null },
}, { timestamps: true });

const inventorysModel = mongoose.model('inventorys', inventorySchema);

module.exports = inventorysModel;