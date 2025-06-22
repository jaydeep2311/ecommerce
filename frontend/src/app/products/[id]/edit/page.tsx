'use client';

import { useParams, useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import { useUpdateProduct } from '@/hooks/mutations/useProducts';

const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name must be less than 200 characters')
    .required('Product name is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .required('Description is required'),
  price: Yup.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999, 'Price must be less than 999,999')
    .required('Price is required'),
  originalPrice: Yup.number()
    .min(0, 'Original price must be greater than or equal to 0')
    .optional(),
  category: Yup.string()
    .required('Category is required'),
  stock: Yup.number()
    .min(0, 'Stock must be greater than or equal to 0')
    .required('Stock is required'),
  images: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string().url('Must be a valid URL').required('Image URL is required'),
        alt: Yup.string().optional(),
        isPrimary: Yup.boolean().optional(),
      })
    )
    .min(1, 'At least one image is required'),
});

const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Garden',
  'Sports & Outdoors',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Food & Beverages',
  'Other'
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['products', productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: !!productId,
  });

  const updateProductMutation = useUpdateProduct();

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !productData) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-8">The product you're trying to edit doesn't exist.</p>
              <button
                onClick={() => router.push('/products/manage')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const product = productData.data;

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Formik
              initialValues={{
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                originalPrice: product.originalPrice?.toString() || '',
                category: product.category || '',
                subcategory: product.subcategory || '',
                brand: product.brand || '',
                sku: product.sku || '',
                stock: product.stock?.toString() || '',
                lowStockThreshold: product.lowStockThreshold?.toString() || '5',
                weight: product.weight?.toString() || '',
                dimensions: {
                  length: product.dimensions?.length?.toString() || '',
                  width: product.dimensions?.width?.toString() || '',
                  height: product.dimensions?.height?.toString() || '',
                },
                images: product.images?.length > 0 ? product.images : [{ url: '', alt: '', isPrimary: true }],
                tags: product.tags?.length > 0 ? product.tags : [''],
                features: product.features?.length > 0 ? product.features : [''],
                specifications: product.specifications || {},
                isFeatured: product.isFeatured || false,
                isActive: product.isActive !== false,
              }}
              validationSchema={productSchema}
              onSubmit={(values, { setSubmitting }) => {
                // Clean up the data
                const productData = {
                  ...values,
                  price: parseFloat(values.price),
                  originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : undefined,
                  stock: parseInt(values.stock),
                  lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : undefined,
                  weight: values.weight ? parseFloat(values.weight) : undefined,
                  dimensions: {
                    length: values.dimensions.length ? parseFloat(values.dimensions.length) : undefined,
                    width: values.dimensions.width ? parseFloat(values.dimensions.width) : undefined,
                    height: values.dimensions.height ? parseFloat(values.dimensions.height) : undefined,
                  },
                  tags: values.tags.filter(tag => tag.trim() !== ''),
                  features: values.features.filter(feature => feature.trim() !== ''),
                  images: values.images.filter(img => img.url.trim() !== ''),
                };

                // Remove empty dimensions object
                if (!productData.dimensions.length && !productData.dimensions.width && !productData.dimensions.height) {
                  delete productData.dimensions;
                }

                updateProductMutation.mutate({ id: productId, data: productData }, {
                  onSuccess: () => {
                    setSubmitting(false);
                    router.push('/products/manage');
                  },
                  onError: () => setSubmitting(false),
                });
              }}
            >
              {({ values, isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <Field
                          id="name"
                          name="name"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <Field
                          as="select"
                          id="category"
                          name="category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <Field
                          id="brand"
                          name="brand"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="brand" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                          SKU
                        </label>
                        <Field
                          id="sku"
                          name="sku"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="sku" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <Field
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price (for discounts)
                        </label>
                        <Field
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="originalPrice" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity *
                        </label>
                        <Field
                          id="stock"
                          name="stock"
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="stock" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                          Low Stock Threshold
                        </label>
                        <Field
                          id="lowStockThreshold"
                          name="lowStockThreshold"
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="lowStockThreshold" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Product Images</h2>
                    <FieldArray name="images">
                      {({ push, remove }) => (
                        <div className="space-y-4">
                          {values.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md">
                              <div className="flex-1">
                                <Field
                                  name={`images.${index}.url`}
                                  type="url"
                                  placeholder="Image URL"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name={`images.${index}.url`} component="div" className="mt-1 text-sm text-red-600" />
                              </div>
                              <div className="w-32">
                                <Field
                                  name={`images.${index}.alt`}
                                  type="text"
                                  placeholder="Alt text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex items-center">
                                <Field
                                  name={`images.${index}.isPrimary`}
                                  type="checkbox"
                                  className="mr-2"
                                  onChange={(e: any) => {
                                    if (e.target.checked) {
                                      // Uncheck all other primary flags
                                      values.images.forEach((_, i) => {
                                        if (i !== index) {
                                          setFieldValue(`images.${i}.isPrimary`, false);
                                        }
                                      });
                                    }
                                    setFieldValue(`images.${index}.isPrimary`, e.target.checked);
                                  }}
                                />
                                <label className="text-sm">Primary</label>
                              </div>
                              {values.images.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push({ url: '', alt: '', isPrimary: false })}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            + Add Another Image
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Features */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Features</h2>
                    <FieldArray name="features">
                      {({ push, remove }) => (
                        <div className="space-y-2">
                          {values.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Field
                                name={`features.${index}`}
                                type="text"
                                placeholder="Product feature"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {values.features.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push('')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            + Add Feature
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Settings */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Field
                          name="isFeatured"
                          type="checkbox"
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Featured Product
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Field
                          name="isActive"
                          type="checkbox"
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Active (visible to customers)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || updateProductMutation.isPending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
