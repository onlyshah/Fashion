const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String, // For videos
    duration: Number // For videos in seconds
  },
  caption: {
    type: String,
    maxlength: 500
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    position: {
      x: Number, // X coordinate percentage
      y: Number  // Y coordinate percentage
    },
    size: String, // Selected size
    color: String // Selected color
  }],
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    productClicks: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowSharing: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    }
  }
}, {
  timestamps: true
});

// Indexes
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ isActive: 1 });

// Virtual for like count
storySchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for view count
storySchema.virtual('viewsCount').get(function() {
  return this.viewers.length;
});

// Virtual for share count
storySchema.virtual('sharesCount').get(function() {
  return this.shares.length;
});

module.exports = mongoose.model('Story', storySchema);
