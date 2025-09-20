'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Geçici olarak basit kontrol - gerçek projede API'den gelecek
      if (email === 'admin@mcangilmotors.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'temp_token');
        router.push('/admin/dashboard');
      } else {
        setError('Geçersiz email veya şifre');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-prestige-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-prestige-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-prestige-gold-light/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-prestige-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-prestige-gold-dark/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-prestige-gold-light/8 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center mb-10">
          <div className="relative">
            {/* Logo Background Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-gradient-to-br from-prestige-gold/40 to-prestige-gold-light/25 rounded-full blur-xl"></div>
              <div className="absolute w-28 h-28 bg-gradient-to-br from-prestige-gold/50 to-prestige-gold-light/30 rounded-full blur-lg"></div>
              <div className="absolute w-20 h-20 bg-gradient-to-br from-prestige-gold/60 to-prestige-gold-light/40 rounded-full blur-md"></div>
            </div>
            
            <div className="relative bg-prestige-card p-4 rounded-2xl shadow-prestige-lg border border-prestige-gold/20">
              <Image
                src="/logo.png"
                alt="Mustafa Cangil Auto Trading Ltd."
                width={140}
                height={90}
                className="h-18 w-auto drop-shadow-lg"
              />
            </div>
          </div>
        </div>
        <h2 className="text-center text-5xl font-prestige-sans font-bold text-prestige-black prestige-text-glow mb-2">
          Admin Panel
        </h2>
        <p className="text-center text-xl text-prestige-gray font-prestige-sans leading-relaxed">
          Access your premium management dashboard
        </p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="premium-card py-10 px-8 shadow-prestige-xl border border-prestige-gold/30 rounded-3xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-2xl font-prestige-sans text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-3">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-6 py-4 border-2 border-prestige-border rounded-2xl placeholder-prestige-light-gray focus:outline-none focus:ring-2 focus:ring-prestige-gold focus:border-prestige-gold text-prestige-black font-prestige-sans transition-all duration-300 text-lg"
                  placeholder="admin@mcangilmotors.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-prestige-sans font-semibold text-prestige-black mb-3">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-6 py-4 border-2 border-prestige-border rounded-2xl placeholder-prestige-light-gray focus:outline-none focus:ring-2 focus:ring-prestige-gold focus:border-prestige-gold text-prestige-black font-prestige-sans transition-all duration-300 text-lg"
                  placeholder="admin123"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-6 border-2 border-prestige-gold/30 rounded-2xl shadow-prestige text-lg font-prestige-sans font-semibold text-prestige-black bg-gradient-to-r from-prestige-gold to-prestige-gold-light hover:from-prestige-gold-dark hover:to-prestige-gold focus:outline-none focus:ring-2 focus:ring-prestige-gold disabled:opacity-50 transform hover:-translate-y-1 transition-all duration-300 premium-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="bg-gradient-to-r from-prestige-gold/10 to-prestige-gold-light/10 border-2 border-prestige-gold/20 text-prestige-black px-6 py-4 rounded-2xl text-sm font-prestige-sans">
              <strong className="text-prestige-gold font-semibold">Test Credentials:</strong><br />
              <span className="text-prestige-gray">Email: admin@mcangilmotors.com</span><br />
              <span className="text-prestige-gray">Password: admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



