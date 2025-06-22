'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import UserOnlyRoute from '@/components/UserOnlyRoute';
import { useAuth } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Fetch user orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'user'],
    queryFn: () => ordersApi.getUserOrders(),
  });

  const orders = ordersData?.data || [];

  // Calculate user order analytics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.pricing.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  const tabs = [
    { id: 'orders' as const, name: 'Order Analytics', icon: '📊' },
    { id: 'profile' as const, name: 'Profile', icon: '👤' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <UserOnlyRoute redirectTo="/dashboard">
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Order Analytics Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">Loading your order analytics...</p>
                    </div>
                  ) : (
                    <>
                      {/* Order Statistics */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-blue-100">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-blue-600">Total Orders</p>
                                <p className="text-xl font-bold text-blue-900">{totalOrders}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-green-100">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-600">Total Spent</p>
                                <p className="text-xl font-bold text-green-900">${totalSpent.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-purple-100">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-purple-600">Average Order</p>
                                <p className="text-xl font-bold text-purple-900">${averageOrderValue.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-orange-100">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-orange-600">Delivered</p>
                                <p className="text-xl font-bold text-orange-900">{deliveredOrders}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Status Breakdown */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                                <span className="text-gray-700">Pending</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">{pendingOrders}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                                <span className="text-gray-700">Processing</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-400 h-2 rounded-full"
                                    style={{ width: `${totalOrders > 0 ? (processingOrders / totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">{processingOrders}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                                <span className="text-gray-700">Shipped</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-400 h-2 rounded-full"
                                    style={{ width: `${totalOrders > 0 ? (shippedOrders / totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">{shippedOrders}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-gray-700">Delivered</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-400 h-2 rounded-full"
                                    style={{ width: `${totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">{deliveredOrders}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                                <span className="text-gray-700">Cancelled</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-red-400 h-2 rounded-full"
                                    style={{ width: `${totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">{cancelledOrders}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Orders */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                        {orders.length > 0 ? (
                          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                            {recentOrders.map((order) => (
                              <div key={order._id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-900">${order.pricing.total.toFixed(2)}</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {orders.length > 5 && (
                              <div className="p-4 text-center">
                                <p className="text-sm text-gray-500">
                                  Showing {recentOrders.length} of {totalOrders} orders
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">No orders yet</h3>
                            <p className="text-gray-500 mt-2">Start shopping to see your order analytics</p>
                            <Link
                              href="/products"
                              className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Browse Products
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>

                  {/* Profile Header */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{user?.name}</h4>
                        <p className="text-gray-600 text-lg">{user?.email}</p>
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 bg-green-100 text-green-800">
                          Customer Account
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Details
                      </h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user?.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">{user?.role}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Order Summary
                      </h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                          <span className="text-sm font-medium text-blue-700">Total Orders</span>
                          <span className="text-lg font-bold text-blue-900">{totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                          <span className="text-sm font-medium text-green-700">Total Spent</span>
                          <span className="text-lg font-bold text-green-900">${totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-md">
                          <span className="text-sm font-medium text-yellow-700">Pending Orders</span>
                          <span className="text-lg font-bold text-yellow-900">{pendingOrders}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-md">
                          <span className="text-sm font-medium text-purple-700">Completed Orders</span>
                          <span className="text-lg font-bold text-purple-900">{deliveredOrders}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                 
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserOnlyRoute>
  );
}
