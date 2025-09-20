'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const isLoginPage = pathname === '/admin/login';
      
      if (!token && !isLoginPage) {
        router.push('/admin/login');
        return;
      }
      
      if (token && isLoginPage) {
        router.push('/admin/dashboard');
        return;
      }
      
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state
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
          <p className="mt-6 text-prestige-gray font-prestige-sans font-medium text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // For login page, don't show sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For authenticated pages, show sidebar
  return (
    <div className="min-h-screen bg-prestige-bg flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-prestige-card border-b border-prestige-border shadow-prestige-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-xl text-prestige-gray hover:text-prestige-gold hover:bg-prestige-gold/10 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-prestige-sans font-bold text-prestige-black">Admin Panel</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-prestige-bg">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
