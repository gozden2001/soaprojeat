const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  author: {
    userId: {
      type: Number,
      required: [true, 'User ID is required']
    },
    username: {
      type: String,
      required: [true, 'Username is required']
    },
    role: {
      type: String,
      enum: ['vodic', 'turista', 'administrator'],
      required: [true, 'Role is required']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Image description cannot exceed 500 characters']
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Index for better query performance
blogSchema.index({ 'author.userId': 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for formatted creation date
blogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('sr-RS');
});

// Method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add like
blogSchema.methods.addLike = function() {
  this.likes += 1;
  return this.save();
};

// Static method to find blogs by author
blogSchema.statics.findByAuthor = function(userId) {
  return this.find({ 'author.userId': userId }).sort({ createdAt: -1 });
};

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ isPublished: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Blog', blogSchema);