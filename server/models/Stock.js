import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.model('Stock', stockSchema);
