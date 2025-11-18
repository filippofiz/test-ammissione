import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@admission/ui';
import { signIn } from '../lib/auth';

export function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success && result.profile) {
        // Check if user must change password
        if (result.mustChangePassword) {
          navigate('/change-password');
          return;
        }

        // Parse roles array
        const roles = result.profile.roles as string[];
        const tests = result.profile.tests as string[];

        // If only one role
        if (roles.length === 1) {
          const role = roles[0];

          if (role === 'STUDENT') {
            navigate('/student/home');
          } else if (role === 'TUTOR') {
            navigate('/');
          } else if (role === 'ADMIN') {
            navigate('/');
          }
        } else if (roles.length > 1) {
          // Multiple roles - navigate to role selection
          navigate('/role-selection');
        } else {
          setError('No roles assigned to your account');
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
            <span className="inline-block">{t('login.title')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />

          <div className="relative z-10">
            {/* Language Selector */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                    localStorage.getItem('language') === 'en' || !localStorage.getItem('language')
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-brand-dark'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('it')}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                    localStorage.getItem('language') === 'it'
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-gray-600 hover:text-brand-dark'
                  }`}
                >
                  IT
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="email"
                label={t('login.email')}
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label={t('login.password')}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{t('login.rememberMe')}</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  {t('login.forgotPassword')}
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {t('login.loginButton')}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {t('login.noAccount')}{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                {t('login.signUp')}
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
