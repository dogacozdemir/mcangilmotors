'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
    description: 'Overview and statistics'
  },
  {
    name: 'Cars',
    href: '/admin/cars',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    description: 'Vehicle inventory management'
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    description: 'Vehicle categories'
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Content management'
  },
  {
    name: 'Offers',
    href: '/admin/offers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    description: 'Customer inquiries'
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Static content'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Site configuration'
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-prestige-card shadow-prestige-xl border-r border-prestige-border transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto lg:flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-prestige-border bg-gradient-to-r from-prestige-gold/5 to-prestige-gold-light/5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Logo background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-prestige-gold/20 to-prestige-gold-light/20 rounded-xl blur-sm"></div>
                <div className="relative bg-prestige-card p-2 rounded-xl shadow-prestige-sm">
                  <Image
                    src="/logo.png"
                    alt="Mustafa Cangil Auto Trading Ltd."
                    width={48}
                    height={32}
                    className="h-8 w-auto"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-prestige-sans font-bold text-prestige-black">Admin Panel</h1>
                <p className="text-sm text-prestige-gray font-prestige-sans">Management Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-3 rounded-xl text-prestige-gray hover:text-prestige-gold hover:bg-prestige-gold/10 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-4 text-sm font-prestige-sans font-medium rounded-2xl transition-all duration-300 transform hover:scale-105
                    ${isActive 
                      ? 'bg-gradient-to-r from-prestige-gold to-prestige-gold-light text-prestige-black shadow-prestige-md border border-prestige-gold/30' 
                      : 'text-prestige-gray hover:bg-prestige-gold/10 hover:text-prestige-gold hover:shadow-prestige-sm'
                    }
                  `}
                  onClick={onClose}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-prestige-black/10 shadow-prestige-sm' 
                      : 'bg-prestige-gray/10 group-hover:bg-prestige-gold/20 group-hover:scale-110'
                    }
                  `}>
                    <div className={`transition-colors duration-300 ${isActive ? 'text-prestige-black' : 'text-prestige-gray group-hover:text-prestige-gold'}`}>
                      {item.icon}
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className={`font-prestige-sans font-semibold transition-colors duration-300 ${isActive ? 'text-prestige-black' : 'text-prestige-gray group-hover:text-prestige-gold'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs font-prestige-sans transition-colors duration-300 ${isActive ? 'text-prestige-black/70' : 'text-prestige-gray/60 group-hover:text-prestige-gold/80'}`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-prestige-black rounded-full"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-prestige-border bg-gradient-to-r from-prestige-gold/5 to-prestige-gold-light/5 space-y-3">
            <Link
              href="/"
              className="group flex items-center px-4 py-3 text-sm font-prestige-sans font-medium text-prestige-gray rounded-xl hover:bg-prestige-gold/10 hover:text-prestige-gold transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-prestige-gray/10 group-hover:bg-prestige-gold/20 transition-colors duration-300">
                <svg className="w-4 h-4 text-prestige-gray group-hover:text-prestige-gold transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <span className="ml-3">View Site</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
              }}
              className="w-full group flex items-center px-4 py-3 text-sm font-prestige-sans font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-300">
                <svg className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
