import mongoose from 'mongoose';

const DownloadSchema = new mongoose.Schema({
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
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Download || mongoose.model('Download', DownloadSchema);
