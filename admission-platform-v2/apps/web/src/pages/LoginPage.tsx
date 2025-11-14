import { useState } from 'react';
import { Button, Input } from '@admission/ui';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Connect to Supabase auth
    // Role will be determined automatically from user profile after login
    console.log('Login:', { email, password });

    setTimeout(() => {
      setLoading(false);
      alert('Login functionality coming soon! Role will be auto-detected from profile.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Mobile Warning - Only for phones (< 768px) */}
      <div className="md:hidden w-full max-w-md animate-fadeInUp relative z-10 text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Up to Ten"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-4">
            📱 Mobile Not Supported
          </h2>
          <p className="text-gray-700 mb-4">
            Please use a <strong>PC</strong>, <strong>tablet</strong>, or <strong>iPad</strong> to access the platform.
          </p>
          <p className="text-sm text-gray-600">
            Our platform requires a larger screen for the best testing experience.
          </p>
        </div>
      </div>

      {/* Login Container - Hidden on mobile phones */}
      <div className="hidden md:block w-full max-w-md animate-fadeInUp relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* Up to Ten Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Up to Ten"
              className="h-16 md:h-20 w-auto object-contain animate-fadeInUp"
            />
          </div>

          {/* "Admission Test Platform" Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
            <span className="inline-block">Admission</span>{' '}
            <span className="inline-block text-brand-green">Test</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm">
            Excellence in Test Preparation
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />

          <div className="relative z-10">
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="email"
                label="Email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2025 Up to Ten. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
