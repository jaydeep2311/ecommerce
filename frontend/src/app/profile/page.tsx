'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/stores/authStore';
import { useUpdateProfile, useUpdatePassword } from '@/hooks/mutations/useAuth';

const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .optional(),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Change Password
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  
                  <Formik
                    initialValues={{
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: {
                        street: user.address?.street || '',
                        city: user.address?.city || '',
                        state: user.address?.state || '',
                        zipCode: user.address?.zipCode || '',
                        country: user.address?.country || 'USA',
                      },
                    }}
                    validationSchema={profileSchema}
                    onSubmit={(values, { setSubmitting }) => {
                      updateProfileMutation.mutate(values, {
                        onSettled: () => setSubmitting(false),
                      });
                    }}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address *
                            </label>
                            <Field
                              id="email"
                              name="email"
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <Field
                              id="phone"
                              name="phone"
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Role
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              <span className="capitalize">{user.role}</span>
                            </div>
                          </div>
                        </div>

                        {/* Address Section */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address
                              </label>
                              <Field
                                id="address.street"
                                name="address.street"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                              </label>
                              <Field
                                id="address.city"
                                name="address.city"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                                State
                              </label>
                              <Field
                                id="address.state"
                                name="address.state"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP Code
                              </label>
                              <Field
                                id="address.zipCode"
                                name="address.zipCode"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <Field
                                id="address.country"
                                name="address.country"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting || updateProfileMutation.isPending}
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting || updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                  
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }}
                    validationSchema={passwordSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                      updatePasswordMutation.mutate(
                        {
                          currentPassword: values.currentPassword,
                          newPassword: values.newPassword,
                        },
                        {
                          onSuccess: () => {
                            resetForm();
                          },
                          onSettled: () => setSubmitting(false),
                        }
                      );
                    }}
                  >
                    {({ isSubmitting }) => (
                      <Form className="space-y-6 max-w-md">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password *
                          </label>
                          <Field
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password *
                          </label>
                          <Field
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password *
                          </label>
                          <Field
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting || updatePasswordMutation.isPending}
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting || updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
