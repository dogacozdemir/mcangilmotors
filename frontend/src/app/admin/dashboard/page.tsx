'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalCars: number;
  totalBlogPosts: number;
  pendingOffers: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    totalBlogPosts: 0,
    pendingOffers: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [carsRes, blogRes, offersRes, customersRes] = await Promise.all([
        fetch('/api/cars?limit=1'),
        fetch('/api/blog?limit=1'),
        fetch('/api/offers?status=pending&limit=1'),
        fetch('/api/customers?limit=1')
      ]);

      const [carsData, blogData, offersData, customersData] = await Promise.all([
        carsRes.json(),
        blogRes.json(),
        offersRes.json(),
        customersRes.json()
      ]);

      setStats({
        totalCars: carsData.pagination?.total || 0,
        totalBlogPosts: blogData.pagination?.total || 0,
        pendingOffers: offersData.pagination?.total || 0,
        totalCustomers: customersData.pagination?.total || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-prestige-bg">
        <div className="text-center">
          <div className="relative">
            {/* Prestige loading animation */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-prestige-gold/30 border-t-prestige-gold mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-prestige-gold to-prestige-gold-light rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-prestige-gray font-prestige-sans font-medium text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const adminMenuItems = [
    {
      title: 'Cars',
      description: 'Manage vehicle inventory',
      href: '/admin/cars',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Categories',
      description: 'Vehicle categories',
      href: '/admin/categories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Blog',
      description: 'Content management',
      href: '/admin/blog',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Offers',
      description: 'Customer inquiries',
      href: '/admin/offers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Pages',
      description: 'Static content',
      href: '/admin/pages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Settings',
      description: 'Site configuration',
      href: '/admin/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-prestige-bg">
      <div className="py-8 px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="relative overflow-hidden bg-gradient-to-br from-prestige-gold via-prestige-gold-light to-prestige-gold-dark rounded-3xl p-10 text-prestige-black shadow-prestige-xl border border-prestige-gold/20">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-prestige-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-prestige-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-prestige-sans font-bold mb-4 text-prestige-black">
                Welcome back! 👋
              </h2>
              <p className="text-xl text-prestige-black/80 font-prestige-sans leading-relaxed">
                Manage your car dealership operations efficiently from this premium dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="prestige-card group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-prestige-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-prestige-sans font-semibold text-prestige-gray uppercase tracking-wide">Total Cars</p>
                <p className="text-4xl font-prestige-sans font-bold text-prestige-black">{stats.totalCars}</p>
              </div>
            </div>
          </div>

          <div className="prestige-card group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-prestige-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-prestige-sans font-semibold text-prestige-gray uppercase tracking-wide">Blog Posts</p>
                <p className="text-4xl font-prestige-sans font-bold text-prestige-black">{stats.totalBlogPosts}</p>
              </div>
            </div>
          </div>

          <div className="prestige-card group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-prestige-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-prestige-sans font-semibold text-prestige-gray uppercase tracking-wide">Pending Offers</p>
                <p className="text-4xl font-prestige-sans font-bold text-prestige-black">{stats.pendingOffers}</p>
              </div>
            </div>
          </div>

          <div className="prestige-card group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-prestige-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-sm font-prestige-sans font-semibold text-prestige-gray uppercase tracking-wide">Customers</p>
                <p className="text-4xl font-prestige-sans font-bold text-prestige-black">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-3xl font-prestige-sans font-bold text-prestige-black mb-8">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group premium-card p-8 hover:shadow-prestige-hover hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-start space-x-6">
                  <div className={`flex-shrink-0 w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-prestige-md`}>
                    <div className={`${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-prestige-sans font-bold text-prestige-black group-hover:text-prestige-gold transition-colors mb-3">
                      {item.title}
                    </h4>
                    <p className="text-sm text-prestige-gray leading-relaxed font-prestige-sans">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-prestige-gray/10 group-hover:bg-prestige-gold group-hover:text-prestige-black rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <svg className="w-5 h-5 text-prestige-gray group-hover:text-prestige-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

