// models/Revenue.js
import mongoose from 'mongoose';

const RevenueSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  revenue: { type: Number, required: true }
});

export default mongoose.models.Revenue || mongoose.model('Revenue', RevenueSchema);
