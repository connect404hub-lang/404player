import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
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
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.History || mongoose.model('History', HistorySchema);
