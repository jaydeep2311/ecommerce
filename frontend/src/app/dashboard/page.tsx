'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { ordersApi } from '@/api/orders';

export default function DashboardPage() {
  // Set default date range to last 30 days
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Validate date range
  const isValidDateRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) return true; // Allow empty dates
    return new Date(dateRange.startDate) <= new Date(dateRange.endDate);
  };

  // Fetch dashboard analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'dashboard', dateRange],
    queryFn: () => {
      // Only make API call if date range is valid
      if (!isValidDateRange()) {
        throw new Error('Start date cannot be after end date');
      }

      return analyticsApi.getDashboardAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
    },
    enabled: isValidDateRange(), // Only enable query if date range is valid
  });

  // Fetch sales analytics
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'sales', dateRange],
    queryFn: () => {
      if (!isValidDateRange()) {
        throw new Error('Start date cannot be after end date');
      }

      return analyticsApi.getSalesAnalytics({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        period: 'daily',
      });
    },
    enabled: isValidDateRange(),
  });

  // Fetch recent orders for sales report (ALL orders from ALL users)
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders', 'all', dateRange],
    queryFn: () => {
      if (!isValidDateRange()) {
        throw new Error('Start date cannot be after end date');
      }

      return ordersApi.getAllOrders({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        limit: 15, // Show more orders for admin overview
        page: 1,
        // No userId filter - get ALL orders from ALL users
      });
    },
    enabled: isValidDateRange(),
  });

  const analytics = analyticsData?.data;
  const salesAnalytics = salesData?.data;
  const orders = ordersData?.data || [];

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    isValidDateRange()
                      ? 'border-gray-300 focus:ring-blue-500'
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    isValidDateRange()
                      ? 'border-gray-300 focus:ring-blue-500'
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDateRange(getDefaultDateRange())}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  All Time
                </button>
              </div>
            </div>
            {!isValidDateRange() && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-red-600">
                    Start date cannot be after end date. Please adjust your date range.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              href="/products/add"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold">Add Product</h3>
                  <p className="text-blue-100">Create new product</p>
                </div>
              </div>
            </Link>

            <Link
              href="/products/manage"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold">Manage Products</h3>
                  <p className="text-green-100">Edit & delete products</p>
                </div>
              </div>
            </Link>

            <Link
              href="/orders/manage"
              className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold">Manage Orders</h3>
                  <p className="text-purple-100">View & update orders</p>
                </div>
              </div>
            </Link>

            <Link
              href="/users/manage"
              className="bg-orange-600 text-white p-6 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold">Manage Users</h3>
                  <p className="text-orange-100">View & manage users</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Analytics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${analytics.overview.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.stockAlerts.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Sales Report Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Report</h2>

            {salesLoading || ordersLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Charts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>

                  {salesAnalytics && salesAnalytics.salesTrends.length > 0 ? (
                    <div className="space-y-6">
                      {/* Total Orders vs Paid Orders Chart */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Orders Overview</h4>
                        <div className="space-y-3">
                          {salesAnalytics.salesTrends.slice(0, 7).map((trend, index) => {
                            const date = new Date(trend._id.year, (trend._id.month || 1) - 1, trend._id.day || 1);
                            const maxOrders = Math.max(...salesAnalytics.salesTrends.map(t => t.orders));
                            const paidOrders = Math.round(trend.orders * 0.85); // Assuming 85% are paid

                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {trend.orders} orders
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {/* Total Orders Bar */}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-blue-600 w-12">Total</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${maxOrders > 0 ? (trend.orders / maxOrders) * 100 : 0}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 w-8">{trend.orders}</span>
                                  </div>
                                  {/* Paid Orders Bar */}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-green-600 w-12">Paid</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${maxOrders > 0 ? (paidOrders / maxOrders) * 100 : 0}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 w-8">{paidOrders}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Revenue Chart */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Revenue Trends</h4>
                        <div className="space-y-2">
                          {salesAnalytics.salesTrends.slice(0, 7).map((trend, index) => {
                            const date = new Date(trend._id.year, (trend._id.month || 1) - 1, trend._id.day || 1);
                            const maxRevenue = Math.max(...salesAnalytics.salesTrends.map(t => t.revenue));

                            return (
                              <div key={index} className="flex items-center space-x-3">
                                <span className="text-xs text-gray-600 w-16">
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                                    style={{ width: `${maxRevenue > 0 ? (trend.revenue / maxRevenue) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-900 font-medium w-16">
                                  ${trend.revenue.toFixed(0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-gray-500 mt-2">No sales data available for this period</p>
                    </div>
                  )}
                </div>

                {/* All Orders List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">All Orders</h3>
                      <p className="text-sm text-gray-500">Orders from all customers</p>
                    </div>
                    <Link
                      href="/orders/manage"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Manage All →
                    </Link>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {order.user?.name || 'Unknown User'}
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                                  </svg>
                                  {order.items.length} item(s)
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                                  </svg>
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900">${order.pricing.total.toFixed(2)}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.paymentInfo?.status === 'paid' ? 'bg-green-100 text-green-700' :
                                order.paymentInfo?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {order.paymentInfo?.status === 'paid' ? '💳 Paid' :
                                 order.paymentInfo?.status === 'pending' ? '⏳ Pending' :
                                 '❌ Unpaid'}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          {order.items.length > 0 && (
                            <div className="border-t border-gray-100 pt-2 mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                </span>
                                <span>
                                  {order.user?.email || 'No email'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Summary Footer */}
                      <div className="border-t border-gray-200 pt-3 mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Showing {orders.length} recent orders from all customers</span>
                          <span>
                            Total Value: ${orders.reduce((sum, order) => sum + order.pricing.total, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mt-4">No orders found</h3>
                      <p className="text-gray-500 mt-2">No orders from any customers found for this period</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting the date range or check if there are any orders in the system</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.ordersByStatus).map(([status, data]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-gray-700">{status.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${analytics.overview.totalOrders > 0 ? (data.count / analytics.overview.totalOrders) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{data.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Activities</h2>
                  <Link
                    href="/orders/manage"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {analytics.recentActivities.map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">#{activity.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {activity.user.name} - {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${activity.pricing.total.toFixed(2)}</p>
                        <p className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          activity.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.recentActivities.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
