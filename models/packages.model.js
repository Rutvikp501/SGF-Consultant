const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "CLASSIC", "PREMIUM"
  name: { type: String, required: true }, // e.g., "CLASSIC EXCEPTIONAL"
  graphers: { type: Number, }, // e.g., 3
  price: { type: String,  }, // e.g., "INR 53,700/-"
  delivery: { type: String, }, // e.g., "30 Days Delivery Guaranteed"
  duration: { type: String, }, // e.g., "1 DAY PACKAGE"
  services: [
      {
          serviceName: { type: String, }, // e.g., "Traditional Photographer"
          quantity: { type: Number,  }, // e.g., 1
          duration: { type: String, }, // e.g., "10hrs"
      },
  ],
  products: [
      {
          productName: { type: String, }, // e.g., "Pendrive"
          quantity: { type: Number, }, // e.g., 2
          details: { type: String, }, // Additional details like "1x12x36 album"
      },
  ],
  totalServices: { type: Number,  },
  totalProducts: { type: Number, },
});

const packagesModel = mongoose.model('packages', packageSchema);

module.exports = packagesModel;