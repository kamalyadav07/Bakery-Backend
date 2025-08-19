import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageUrl: String,
  imagePublicId: String,
  images: [String] // optional gallery
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
