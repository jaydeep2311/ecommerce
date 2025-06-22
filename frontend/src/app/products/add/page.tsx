'use client';

import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCreateProduct } from '@/hooks/mutations/useProducts';

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

export default function AddProductPage() {
  const router = useRouter();
  const createProductMutation = useCreateProduct();

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
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
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                category: '',
                subcategory: '',
                brand: '',
                sku: '',
                stock: '',
                lowStockThreshold: '5',
                weight: '',
                dimensions: {
                  length: '',
                  width: '',
                  height: '',
                },
                images: [{ url: '', alt: '', isPrimary: true }],
                tags: [''],
                features: [''],
                specifications: {},
                isFeatured: false,
              }}
              validationSchema={productSchema}
              onSubmit={(values, { setSubmitting }) => {
                // Clean up the data
                const dimensions = {
                  length: values.dimensions.length ? parseFloat(values.dimensions.length) : undefined,
                  width: values.dimensions.width ? parseFloat(values.dimensions.width) : undefined,
                  height: values.dimensions.height ? parseFloat(values.dimensions.height) : undefined,
                };

                // Check if dimensions has any values
                const hasDimensions = dimensions.length || dimensions.width || dimensions.height;

                // Exclude dimensions from values spread to avoid type conflicts
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { dimensions: _dimensions, ...valuesWithoutDimensions } = values;

                const productData = {
                  ...valuesWithoutDimensions,
                  price: parseFloat(values.price),
                  originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : undefined,
                  stock: parseInt(values.stock),
                  lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : undefined,
                  weight: values.weight ? parseFloat(values.weight) : undefined,
                  ...(hasDimensions && { dimensions }),
                  tags: values.tags.filter(tag => tag.trim() !== ''),
                  features: values.features.filter(feature => feature.trim() !== ''),
                  images: values.images.filter(img => img.url.trim() !== ''),
                };

                createProductMutation.mutate(productData, {
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
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                  {/* Physical Properties */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Physical Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <Field
                          id="weight"
                          name="weight"
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="weight" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                          Subcategory
                        </label>
                        <Field
                          id="subcategory"
                          name="subcategory"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="subcategory" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Dimensions (cm)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="dimensions.length" className="block text-sm font-medium text-gray-700 mb-1">
                            Length
                          </label>
                          <Field
                            id="dimensions.length"
                            name="dimensions.length"
                            type="number"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <Field
                            id="dimensions.width"
                            name="dimensions.width"
                            type="number"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700 mb-1">
                            Height
                          </label>
                          <Field
                            id="dimensions.height"
                            name="dimensions.height"
                            type="number"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
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

                  {/* Tags */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Tags</h2>
                    <FieldArray name="tags">
                      {({ push, remove }) => (
                        <div className="space-y-2">
                          {values.tags.map((tag, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Field
                                name={`tags.${index}`}
                                type="text"
                                placeholder="Product tag"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {values.tags.length > 1 && (
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
                            + Add Tag
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Settings */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
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
                    <p className="text-sm text-gray-500 mt-1">
                      Featured products will be highlighted on the homepage and in search results.
                    </p>
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
                      disabled={isSubmitting || createProductMutation.isPending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || createProductMutation.isPending ? 'Creating...' : 'Create Product'}
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
