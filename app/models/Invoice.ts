// models/Invoice.js
import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    date: { type: Date, required: true }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
