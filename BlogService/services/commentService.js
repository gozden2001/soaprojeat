const Comment = require('../models/comment');
const Follow = require('../models/follow');

class CommentService {
  
  // Create new comment (only followers can comment)
  async createComment(blogId, commentData, authorId, authorUsername, authorRole, blogAuthorId) {
    try {
      // Check if the commenter is following the blog author (unless commenting on own blog)
      if (authorId !== blogAuthorId) {
        const followCheck = await Follow.findOne({
          'follower.userId': authorId,
          'following.userId': blogAuthorId
        });

        if (!followCheck) {
          return {
            success: false,
            error: 'You must follow the blog author to comment on their posts'
          };
        }
      }

      // Create comment
      const comment = new Comment({
        blogId,
        author: {
          userId: authorId,
          username: authorUsername,
          role: authorRole
        },
        content: commentData.content.trim()
      });

      await comment.save();

      return {
        success: true,
        data: comment,
        message: 'Comment added successfully'
      };

    } catch (error) {
      console.error('Create comment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get comments for a blog
  async getCommentsByBlog(blogId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const comments = await Comment.find({ blogId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Comment.countDocuments({ blogId });
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          comments,
          pagination: {
            currentPage: page,
            totalPages,
            totalComments: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get comments error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update comment (only author can update)
  async updateComment(commentId, updateData, authorId) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found'
        };
      }

      if (comment.author.userId !== authorId) {
        return {
          success: false,
          error: 'You can only edit your own comments'
        };
      }

      comment.content = updateData.content.trim();
      comment.updatedAt = new Date();
      
      await comment.save();

      return {
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      };

    } catch (error) {
      console.error('Update comment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete comment (only author can delete)
  async deleteComment(commentId, authorId) {
    try {
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return {
          success: false,
          error: 'Comment not found'
        };
      }

      if (comment.author.userId !== authorId) {
        return {
          success: false,
          error: 'You can only delete your own comments'
        };
      }

      await Comment.findByIdAndDelete(commentId);

      return {
        success: true,
        message: 'Comment deleted successfully'
      };

    } catch (error) {
      console.error('Delete comment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get comments by user
  async getCommentsByUser(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const comments = await Comment.find({ 'author.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('blogId', 'title')
        .select('-__v');

      const total = await Comment.countDocuments({ 'author.userId': userId });
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          comments,
          pagination: {
            currentPage: page,
            totalPages,
            totalComments: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get user comments error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get comment statistics
  async getCommentStats() {
    try {
      const totalComments = await Comment.countDocuments();
      
      const topCommenters = await Comment.aggregate([
        { 
          $group: { 
            _id: '$author.userId', 
            count: { $sum: 1 }, 
            username: { $first: '$author.username' } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const recentComments = await Comment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('blogId', 'title')
        .select('author content createdAt blogId');

      return {
        success: true,
        data: {
          totalComments,
          topCommenters,
          recentComments
        }
      };

    } catch (error) {
      console.error('Get comment stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CommentService();