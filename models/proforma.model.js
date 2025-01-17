const mongoose = require('mongoose');

const ProformaSchema = new mongoose.Schema(
    {
        lead_Id: { type: Number, required: true }, // Unique Lead ID
        booking_name: { type: String, required: true }, // Booking name
        specials_name: { type: String }, // Specials name
        event_name: { type: String, required: true }, // Event name
        email_id: { type: String, required: true }, // Email ID
        mobile_no: { type: String, required: true }, // Mobile number
        quotation_no: { type: String, required: true }, // Quotation number
        quotation_date: { type: Date, required: true }, // Quotation date
        event_date: { type: Date, required: true }, // Event date
        event_time: { type: String, required: true }, // Event time
        event_location: { type: String, required: true }, // Event location
        home_address: { type: String }, // Home address
        service_type: { type: String, required: true }, // Type of service
        format: { type: String }, // Format details

        // Updated items array schema
        items: [
            {
                name: { type: String, required: true }, // Item name
                price: { type: Number, required: true }, // Item price
                quantity: { type: Number, required: true }, // Quantity
                description: { type: String }, // Optional description
                item_id: { type: mongoose.Schema.Types.ObjectId }, // Optional reference to an inventory item
                date_added: { type: Date, default: Date.now }, // Timestamp for when the item was added
            },
        ],

        subtotal: { type: Number, required: true }, // Subtotal amount
        discount: { type: Number }, // Discount percentage
        gst: { type: Number }, // GST percentage
        finalTotal: { type: Number, required: true }, // Final total

        // Payment status array
        paymentstatus: [
            {
                isPaid: { type: Boolean, required: true }, // Payment status
                paymentDate: { type: Date, required: true }, // Payment due/received date
            },
        ],
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

const proformaModel = mongoose.model('Proforma', ProformaSchema);

module.exports = proformaModel;
