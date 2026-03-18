import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Mail, Lock, User, LogIn, Copy, Check } from 'lucide-react';
import { DEMO_CREDENTIALS } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: keyof typeof DEMO_CREDENTIALS) => {
    const credentials = DEMO_CREDENTIALS[role];
    setValue('email', credentials.email);
    setValue('password', credentials.password);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const copyCredentials = (role: keyof typeof DEMO_CREDENTIALS) => {
    const credentials = DEMO_CREDENTIALS[role];
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopiedRole(role);
    toast.success('Credentials copied!');
    setTimeout(() => setCopiedRole(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-primary-50 dark:from-dark-bg dark:to-dark-surface transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
              WB Alloys Service Management
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Login Form */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
                Sign In
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Sign in to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    id="email"
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    type="password"
                    id="password"
                    className="input-field pl-10"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-dark-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-dark-text-secondary">
                    or
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-700 dark:text-dark-text font-medium">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 dark:text-dark-text font-medium">Sign in with Google</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo Credentials Panel */}
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
              🎓 Demo Login Credentials
            </h2>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-6">
              Click any role below to auto-fill credentials or copy them
            </p>

            <div className="space-y-4">
              {/* Customer Demo */}
              <div className="card p-4 border-2 border-transparent hover:border-blue-400 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center space-x-2">
                      <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        Customer
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                      Create and track service requests
                    </p>
                  </div>
                  <button
                    onClick={() => copyCredentials('customer')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                    title="Copy credentials"
                  >
                    {copiedRole === 'customer' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Email:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.customer.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Password:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.customer.password}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => fillDemoCredentials('customer')}
                  className="mt-3 w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                >
                  Auto-fill Customer Login
                </button>
              </div>

              {/* Engineer Demo */}
              <div className="card p-4 border-2 border-transparent hover:border-green-400 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center space-x-2">
                      <span className="badge bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Engineer
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                      Accept and complete jobs
                    </p>
                  </div>
                  <button
                    onClick={() => copyCredentials('engineer')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                    title="Copy credentials"
                  >
                    {copiedRole === 'engineer' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Email:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.engineer.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Password:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.engineer.password}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => fillDemoCredentials('engineer')}
                  className="mt-3 w-full py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                >
                  Auto-fill Engineer Login
                </button>
              </div>

              {/* Manager Demo */}
              <div className="card p-4 border-2 border-transparent hover:border-purple-400 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center space-x-2">
                      <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                        Manager
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                      Assign and monitor all jobs
                    </p>
                  </div>
                  <button
                    onClick={() => copyCredentials('manager')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                    title="Copy credentials"
                  >
                    {copiedRole === 'manager' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Email:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.manager.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Password:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.manager.password}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => fillDemoCredentials('manager')}
                  className="mt-3 w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
                >
                  Auto-fill Manager Login
                </button>
              </div>

              {/* Admin Demo */}
              <div className="card p-4 border-2 border-transparent hover:border-red-400 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text flex items-center space-x-2">
                      <span className="badge bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        Admin
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
                      Manage users and equipment
                    </p>
                  </div>
                  <button
                    onClick={() => copyCredentials('admin')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                    title="Copy credentials"
                  >
                    {copiedRole === 'admin' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Email:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.admin.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-stone-400">Password:</span>
                    <code className="text-xs bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
                      {DEMO_CREDENTIALS.admin.password}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => fillDemoCredentials('admin')}
                  className="mt-3 w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                >
                  Auto-fill Admin Login
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                ℹ️ <strong>Note:</strong> These are demo credentials for testing. Backend integration is pending.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
