// Search and filter utilities

// Build advanced search query
exports.buildSearchQuery = (queryParams) => {
  let query = { isActive: true };

  // Text search
  if (queryParams.search) {
    query.$text = { $search: queryParams.search };
  }

  // Category filter
  if (queryParams.category) {
    query.category = queryParams.category;
  }

  // Subcategory filter
  if (queryParams.subcategory) {
    query.subcategory = queryParams.subcategory;
  }

  // Brand filter
  if (queryParams.brand) {
    query.brand = queryParams.brand;
  }

  // Price range filter
  if (queryParams.minPrice || queryParams.maxPrice) {
    query.price = {};
    if (queryParams.minPrice) {
      query.price.$gte = parseFloat(queryParams.minPrice);
    }
    if (queryParams.maxPrice) {
      query.price.$lte = parseFloat(queryParams.maxPrice);
    }
  }

  // Rating filter
  if (queryParams.minRating) {
    query['rating.average'] = { $gte: parseFloat(queryParams.minRating) };
  }

  // Stock filter
  if (queryParams.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Featured products
  if (queryParams.featured === 'true') {
    query.isFeatured = true;
  }

  // Tags filter
  if (queryParams.tags) {
    const tags = Array.isArray(queryParams.tags) ? queryParams.tags : [queryParams.tags];
    query.tags = { $in: tags };
  }

  return query;
};

// Build sort object
exports.buildSortQuery = (sortBy, sortOrder = 'asc') => {
  let sort = {};
  const order = sortOrder === 'desc' ? -1 : 1;

  switch (sortBy) {
    case 'price':
      sort.price = order;
      break;
    case 'rating':
      sort['rating.average'] = order;
      break;
    case 'newest':
      sort.createdAt = -1;
      break;
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'name':
      sort.name = order;
      break;
    case 'popularity':
      sort['rating.count'] = -1;
      break;
    default:
      sort.createdAt = -1;
  }

  return sort;
};

// Build pagination
exports.buildPagination = (page, limit, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 12;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const pagination = {
    current: currentPage,
    limit: itemsPerPage,
    total: Math.ceil(total / itemsPerPage),
    hasNext: startIndex + itemsPerPage < total,
    hasPrev: startIndex > 0
  };

  if (pagination.hasNext) {
    pagination.next = currentPage + 1;
  }

  if (pagination.hasPrev) {
    pagination.prev = currentPage - 1;
  }

  return { pagination, startIndex, limit: itemsPerPage };
};

// Get price range for category
exports.getPriceRange = async (Product, category = null) => {
  const matchStage = { isActive: true };
  if (category) {
    matchStage.category = category;
  }

  const result = await Product.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  return result[0] || { minPrice: 0, maxPrice: 0 };
};

// Get filter options for products
exports.getFilterOptions = async (Product) => {
  const [categories, brands, priceRange] = await Promise.all([
    Product.distinct('category', { isActive: true }),
    Product.distinct('brand', { isActive: true, brand: { $ne: null, $ne: '' } }),
    exports.getPriceRange(Product)
  ]);

  return {
    categories,
    brands,
    priceRange
  };
};
