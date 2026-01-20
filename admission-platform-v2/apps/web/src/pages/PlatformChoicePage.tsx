import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@admission/ui';
import { getCurrentProfile } from '../lib/auth';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

export function PlatformChoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await getCurrentProfile();
      if (!userProfile) {
        navigate('/login');
        return;
      }
      setProfile(userProfile);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handlePlatformChoice = (platform: 'v1' | 'v2') => {
    if (!profile || !profile.roles) {
      navigate('/login');
      return;
    }

    const roles = profile.roles as string[];
    const role = roles[0] || 'STUDENT'; // Default to STUDENT if no role

    if (platform === 'v1') {
      // Redirect to old platform - based on language selected at login
      const lang = localStorage.getItem('language') || 'en';
      const langFolder = lang === 'it' ? 'italiano' : 'inglese';

      // Get auth user ID to set in sessionStorage (required by old platform)
      const authUid = profile.auth_uid;

      if (!authUid) {
        navigate('/login');
        return;
      }

      if (role === 'STUDENT') {
        sessionStorage.setItem("studentId", authUid);
        window.location.href = `${window.location.origin}/${langFolder}/choose_test.html`;
      } else if (role === 'TUTOR' || role === 'ADMIN') {
        sessionStorage.setItem("tutorId", authUid);
        window.location.href = `${window.location.origin}/${langFolder}/tutor_dashboard.html`;
      } else {
        window.location.href = `${window.location.origin}/${langFolder}/index.html`;
      }
    } else {
      // Navigate to new platform based on role
      if (roles.length === 1) {
        if (role === 'STUDENT') {
          navigate('/student/home');
        } else if (role === 'TUTOR') {
          navigate('/');
        } else if (role === 'ADMIN') {
          navigate('/');
        }
      } else {
        // Multiple roles - navigate to role selection
        navigate('/role-selection');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-2xl animate-fadeInUp relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Up to Ten"
              className="h-16 md:h-20 w-auto object-contain animate-fadeInUp"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
            Choose Your Platform
          </h1>

          <p className="text-gray-600 text-sm">
            Select which version of the platform you'd like to use
          </p>
        </div>

        {/* Platform Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Old Platform Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden hover:shadow-3xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="text-5xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Classic Platform
              </h2>
              <p className="text-gray-600 mb-6 min-h-[60px]">
                Use the familiar, well-tested original platform with all your existing data and features.
              </p>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => handlePlatformChoice('v1')}
              >
                Use Classic Platform
              </Button>
            </div>
          </div>

          {/* New Platform Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden hover:shadow-3xl transition-shadow border-2 border-brand-green/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />

            {/* "NEW" Badge */}
            <div className="absolute top-4 right-4 bg-brand-green text-white px-3 py-1 rounded-full text-xs font-bold">
              NEW
            </div>

            <div className="relative z-10">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                New Platform
              </h2>
              <p className="text-gray-600 mb-6 min-h-[60px]">
                Experience the redesigned platform with modern features, improved performance, and mobile support.
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => handlePlatformChoice('v2')}
              >
                Use New Platform
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>You can change this preference anytime from your settings</p>
        </div>
      </div>
    </div>
  );
}
