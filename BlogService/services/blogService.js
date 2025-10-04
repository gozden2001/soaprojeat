const Blog = require('../models/blog');
const { blogValidators } = require('../validators/blogValidators');

class BlogService {
  
  // Create new blog
  async createBlog(blogData, authorId) {
    try {
      // Validate blog data
      const { error, value } = blogValidators.create.validate(blogData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Create blog with author info
      const blog = new Blog({
        ...value,
        author: {
          userId: authorId,
          username: blogData.authorUsername || 'Unknown',
          role: blogData.authorRole || 'turista'
        }
      });

      await blog.save();
      
      return {
        success: true,
        data: blog,
        message: 'Blog created successfully'
      };

    } catch (error) {
      console.error('Create blog error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all blogs with pagination
  async getAllBlogs(page = 1, limit = 10, tags = null) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      let query = {};
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      const blogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Blog.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          blogs,
          pagination: {
            currentPage: page,
            totalPages,
            totalBlogs: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get all blogs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get blog by ID
  async getBlogById(blogId) {
    try {
      const blog = await Blog.findById(blogId).select('-__v');
      
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      return {
        success: true,
        data: blog
      };

    } catch (error) {
      console.error('Get blog by ID error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get blogs by author
  async getBlogsByAuthor(authorId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const blogs = await Blog.find({ 'author.userId': authorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Blog.countDocuments({ 'author.userId': authorId });
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          blogs,
          pagination: {
            currentPage: page,
            totalPages,
            totalBlogs: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get blogs by author error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update blog
  async updateBlog(blogId, updateData, authorId) {
    try {
      // Check if blog exists and user is author
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      if (blog.author.userId !== authorId) {
        return {
          success: false,
          error: 'Unauthorized: You can only edit your own blogs'
        };
      }

      // Validate update data
      const { error, value } = blogValidators.update.validate(updateData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Update blog
      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-__v');

      return {
        success: true,
        data: updatedBlog,
        message: 'Blog updated successfully'
      };

    } catch (error) {
      console.error('Update blog error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete blog
  async deleteBlog(blogId, authorId) {
    try {
      // Check if blog exists and user is author
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      if (blog.author.userId !== authorId) {
        return {
          success: false,
          error: 'Unauthorized: You can only delete your own blogs'
        };
      }

      await Blog.findByIdAndDelete(blogId);

      return {
        success: true,
        message: 'Blog deleted successfully'
      };

    } catch (error) {
      console.error('Delete blog error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search blogs by title or content
  async searchBlogs(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const searchQuery = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      };

      const blogs = await Blog.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Blog.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          blogs,
          searchTerm,
          pagination: {
            currentPage: page,
            totalPages,
            totalBlogs: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Search blogs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get blogs statistics
  async getBlogStats() {
    try {
      const totalBlogs = await Blog.countDocuments();
      
      const tagStats = await Blog.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const authorStats = await Blog.aggregate([
        { $group: { _id: '$author.userId', count: { $sum: 1 }, username: { $first: '$author.username' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        success: true,
        data: {
          totalBlogs,
          popularTags: tagStats,
          topAuthors: authorStats
        }
      };

    } catch (error) {
      console.error('Get blog stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BlogService();