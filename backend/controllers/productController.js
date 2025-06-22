const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      const searchTerm = req.query.search.trim();

      // Use regex search for partial matches (case-insensitive)
      // This is more flexible than text search and works better for partial matches
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { features: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by subcategory
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }

    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.minRating) {
      query['rating.average'] = { $gte: parseFloat(req.query.minRating) };
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured products
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Build sort
    let sort = {};

    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

      switch (sortField) {
        case 'price':
          sort.price = sortOrder;
          break;
        case 'rating':
          sort['rating.average'] = sortOrder;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'name':
          sort.name = sortOrder;
          break;
        case 'relevance':
          // For relevance, prioritize exact name matches when searching
          if (req.query.search) {
            sort.name = 1;
          } else {
            sort.createdAt = -1;
          }
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      // Default sort: if searching, sort by name for better relevance
      if (req.query.search) {
        sort.name = 1;
      } else {
        sort.createdAt = -1;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.updatedBy = req.user.id;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.softDelete();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use the MongoDB collection directly to bypass all middleware
    const result = await Product.collection.updateOne(
      { _id: mongoose.Types.ObjectId.createFromHexString(id), isDeleted: true },
      {
        $set: {
          isDeleted: false,
          isActive: true,
          deletedAt: null,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Deleted product not found'
      });
    }

    // Fetch the updated product for response
    const product = await Product.findById(id).populate('reviews', 'rating');

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.getDeletedProducts = async (req, res, next) => {
  try {
    const {
      search,
      category
    } = req.query;

    // Build aggregation pipeline to bypass middleware
    const pipeline = [
      // Match deleted products
      { $match: { isDeleted: true } }
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add category filter
    if (category) {
      pipeline.push({
        $match: { category: category }
      });
    }

    // Add lookup for reviews to calculate rating
    pipeline.push(
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          'rating.average': {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          'rating.count': { $size: '$reviews' }
        }
      }
    );

    // Get all deleted products using aggregation
    const products = await Product.aggregate(pipeline);

    // Get total count
    const total = products.length;

    res.status(200).json({
      success: true,
      data: products,
      total,
      count: total
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', {
      isActive: true,
      brand: { $ne: null, $ne: '' }
    });

    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = {
      user: req.user.id,
      rating,
      comment
    };

    product.reviews.push(review);
    await product.calculateAverageRating();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};
