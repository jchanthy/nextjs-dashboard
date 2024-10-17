// models/Customer.js
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    image_url: { type: String, required: false }
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
