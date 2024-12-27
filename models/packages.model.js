const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  service_type: { type: String, required: true }, // e.g., "PhotoGrphy"
  package_type: { type: String, required: true }, // e.g., "CLASSIC", "PREMIUM"
  package_name: { type: String, required: true }, //e.g., "CLASSIC EXCEPTIONAL"
  subname: { type: String, }, // 
  graphers: { type: Number, }, // e.g., 3
  price: { type: String,  }, // e.g., "INR 53,700/-"
  delivery: { type: String, }, // e.g., "30 Days Delivery Guaranteed"
  duration: { type: String, }, // e.g., "1 DAY PACKAGE"
  services_products: [
      {
          serviceName: { type: String, }, // e.g., "Traditional Photographer"
          quantity: { type: Number,  }, // e.g., 1
          duration: { type: String, }, // e.g., "10hrs"
      },
  ],
  totalServices: { type: Number,  },
  totalProducts: { type: Number, },
});

const packagesModel = mongoose.model('packages', packageSchema);

module.exports = packagesModel;