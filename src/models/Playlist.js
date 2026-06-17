import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a playlist name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songs: [
    {
      songId: String,
      title: String,
      artist: String,
      image: String,
      duration: Number,
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
