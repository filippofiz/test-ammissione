import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changePassword, signOut } from '../lib/auth';
import { Input, Button } from '@admission/ui';

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError(t('changePassword.minLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.error'));
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(newPassword);

      if (result.success) {
        // Sign out the user
        await signOut();

        // Show success message
        alert(t('changePassword.success') + ' ' + 'Please login with your new password.');

        // Navigate to login
        navigate('/login');
      } else {
        setError(result.error || t('changePassword.error'));
      }
    } catch (err) {
      setError(t('changePassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Change Password Container */}
      <div className="w-full max-w-md animate-fadeInUp relative z-10">
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

          {/* "Change Password" Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
            <span className="inline-block">{t('changePassword.title').split(' ')[0]}</span>{' '}
            <span className="inline-block text-brand-green">{t('changePassword.title').split(' ')[1]}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-sm">
            {t('changePassword.subtitle')}
          </p>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />

          <div className="relative z-10">
            {/* Change Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="password"
                label={t('changePassword.newPassword')}
                placeholder={t('changePassword.newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                type="password"
                label={t('changePassword.confirmPassword')}
                placeholder={t('changePassword.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                {loading ? t('changePassword.changeButton') + '...' : t('changePassword.changeButton')}
              </Button>
            </form>
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
