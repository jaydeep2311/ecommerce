'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/api/products';
import { useAuth } from '@/stores/authStore';
import { useAddToCart } from '@/hooks/mutations/useCart';
import StarRating from '@/components/StarRating';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (isAdmin) {
      toast.error('Cart functionality is not available for admin users');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCartMutation.mutate({
      productId: product._id,
      quantity: 1,
    });
  };

  const primaryImage = product.primaryImage || product.images[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 w-full">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              -{product.discountPercentage}%
            </div>
          )}

          {/* Stock Status */}
          {product.stockStatus === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        )}

        {/* Rating */}
        <div className="mb-2">
          <StarRating
            rating={product.rating.average}
            readonly
            size="sm"
            showValue
            totalReviews={product.rating.count}
          />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Stock indicator */}
          <div className="text-sm">
            {product.stockStatus === 'low_stock' && (
              <span className="text-orange-500 font-medium">Low Stock</span>
            )}
            {product.stockStatus === 'in_stock' && (
              <span className="text-green-500 font-medium">In Stock</span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Only show for regular users, not admins */}
        {!isAdmin && (
          <button
            onClick={handleAddToCart}
            disabled={product.stockStatus === 'out_of_stock' || addToCartMutation.isPending}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              product.stockStatus === 'out_of_stock' || addToCartMutation.isPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {product.stockStatus === 'out_of_stock'
              ? 'Out of Stock'
              : addToCartMutation.isPending
              ? 'Adding...'
              : 'Add to Cart'
            }
          </button>
        )}

        {/* Admin view - Show product management link instead */}
        {isAdmin && (
          <Link
            href={`/products/manage?edit=${product._id}`}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700 text-center block"
          >
            Manage Product
          </Link>
        )}
      </div>
    </div>
  );
}
