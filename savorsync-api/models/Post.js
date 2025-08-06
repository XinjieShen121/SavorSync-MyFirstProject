const mongoose = require('mongoose');
const { userDb } = require('../config/mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: String,
    required: [true, 'Comment author is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  category: {
    type: String,
    required: [true, 'Post category is required'],
    enum: ['recipe', 'cooking-tip', 'restaurant-review', 'food-story', 'technique'],
    default: 'recipe'
  },
  type: {
    type: String,
    required: [true, 'Post type is required'],
    enum: ['recipe', 'story'],
    default: 'recipe'
  },
  cuisine: {
    type: String,
    trim: true,
    maxlength: [50, 'Cuisine cannot exceed 50 characters']
  },
  author: {
    type: String,
    required: [true, 'Post author is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author ID is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isPublished: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Indexes for better query performance
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ likes: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if a user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

// Method to add comment
postSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to remove comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return this.save();
};

// Static method to get trending posts
postSchema.statics.getTrendingPosts = function(limit = 10, timeframe = 'week') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        isPublished: true,
        isDeleted: false
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $size: '$likes' },
            { $multiply: [{ $size: '$comments' }, 2] }
          ]
        }
      }
    },
    {
      $sort: { score: -1, createdAt: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to search posts
postSchema.statics.searchPosts = function(query, options = {}) {
  const { page = 1, limit = 10, category, author } = options;
  const skip = (page - 1) * limit;

  const searchQuery = {
    $and: [
      { isPublished: true, isDeleted: false },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  if (category) {
    searchQuery.$and.push({ category });
  }

  if (author) {
    searchQuery.$and.push({ author: { $regex: author, $options: 'i' } });
  }

  return this.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('authorId', 'name avatar');
};

// Ensure virtual fields are included when converting to JSON
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    
    // Handle populated authorId field
    if (ret.authorId && typeof ret.authorId === 'object') {
      if (ret.authorId._id) {
        ret.authorId.id = ret.authorId._id.toString();
        delete ret.authorId._id;
      }
    }
    
    // Handle populated likes array
    if (ret.likes && Array.isArray(ret.likes)) {
      ret.likes = ret.likes.map(like => {
        if (typeof like === 'object' && like._id) {
          return like._id.toString();
        }
        return like;
      });
    }
    
    return ret;
  }
});

module.exports = userDb.model('Post', postSchema); 