'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Gamepad2, Phone } from 'lucide-react';

export default function LoginPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validate WhatsApp number format
  const isValidWhatsAppNumber = (number: string): boolean => {
    const cleaned = number.replace(/[\s-]/g, '');
    const whatsappRegex = /^\+?[1-9]\d{9,14}$/;
    return whatsappRegex.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate format before submitting
    if (!isValidWhatsAppNumber(whatsappNumber)) {
      setError('Please enter a valid WhatsApp number (10-15 digits with optional country code)');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        whatsappNumber: whatsappNumber.replace(/[\s-]/g, ''),
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers, +, spaces, and dashes
    const filtered = value.replace(/[^\d+\s-]/g, '');
    setWhatsappNumber(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/25">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            BGMI Tournament
          </h1>
          <p className="text-gray-400 mt-2">Enter your WhatsApp number to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-300">
                WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="whatsappNumber"
                  type="tel"
                  value={whatsappNumber}
                  onChange={handlePhoneChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +91 for India)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !whatsappNumber.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Continue with WhatsApp
                </>
              )}
            </button>
          </form>

          {/* WhatsApp Info */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-400 font-medium">Quick Login</p>
                <p className="text-xs text-gray-400">No password needed - just your WhatsApp number</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Your access level will be set by an administrator
        </p>
      </div>
    </div>
  );
}
