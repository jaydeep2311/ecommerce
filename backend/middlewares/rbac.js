// Role-Based Access Control utilities

// Define permissions for each role
const PERMISSIONS = {
  user: [
    'read:own_profile',
    'update:own_profile',
    'read:products',
    'create:cart',
    'read:own_cart',
    'update:own_cart',
    'delete:own_cart',
    'create:order',
    'read:own_orders',
    'update:own_orders' // Only for cancellation
  ],
  admin: [
    'read:all_users',
    'create:user',
    'update:user',
    'delete:user',
    'read:all_profiles',
    'update:all_profiles',
    'read:products',
    'create:product',
    'update:product',
    'delete:product',
    'read:all_carts',
    'read:all_orders',
    'update:all_orders',
    'delete:all_orders',
    'read:analytics'
  ]
};

// Check if user has specific permission
exports.hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole] && PERMISSIONS[userRole].includes(permission);
};

// Middleware to check specific permission
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!exports.hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Check if user can access resource (own resource or admin)
exports.canAccessResource = (resourceUserId, currentUser) => {
  // Admin can access any resource
  if (currentUser.role === 'admin') {
    return true;
  }

  // User can only access their own resources
  return resourceUserId.toString() === currentUser.id.toString();
};

// Middleware to check resource ownership
exports.checkResourceOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (!exports.canAccessResource(resourceUserId, req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Get user permissions
exports.getUserPermissions = (userRole) => {
  return PERMISSIONS[userRole] || [];
};
