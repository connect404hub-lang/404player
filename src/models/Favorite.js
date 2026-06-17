import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songId: {
    type: String,
    required: true,
  },
  title: String,
  artist: String,
  image: String,
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
