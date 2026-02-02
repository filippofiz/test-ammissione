import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faChalkboardTeacher, faUserShield, faInbox } from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

export function RoleSelectionPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getCurrentProfile();

    if (!userProfile) {
      navigate('/login', { replace: true });
      return;
    }

    const roles = userProfile.roles as string[] || [];

    // If user has only one role, redirect them directly (they shouldn't be here)
    if (roles.length === 1) {
      const role = roles[0];

      if (role === 'STUDENT') {
        navigate('/student/home', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    setProfile(userProfile);
    setLoading(false);
  };

  const handleProceed = () => {
    if (!selectedRole || !profile) return;

    if (selectedRole === 'STUDENT') {
      navigate('/student/home');
    } else if (selectedRole === 'TUTOR') {
      navigate('/tutor');
    } else if (selectedRole === 'ADMIN') {
      navigate('/admin');
    }
  };

  const roles = profile?.roles as string[] || [];

  return (
    <Layout noScroll>
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md animate-fadeInUp relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-brand-dark">
              {t('roleSelection.title')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('roleSelection.subtitle')}
            </p>
          </div>

          {/* Selection Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />

            <div className="relative z-10">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600">{t('roleSelection.loading')}</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faInbox} className="text-6xl mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 text-lg">{t('roleSelection.noRoles')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roles.includes('STUDENT') && (
                    <button
                      onClick={() => setSelectedRole('STUDENT')}
                      className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all transform ${
                        selectedRole === 'STUDENT'
                          ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 text-brand-dark hover:bg-gray-100 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                      {t('roleSelection.student')}
                    </button>
                  )}
                  {roles.includes('TUTOR') && (
                    <button
                      onClick={() => setSelectedRole('TUTOR')}
                      className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all transform ${
                        selectedRole === 'TUTOR'
                          ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 text-brand-dark hover:bg-gray-100 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2" />
                      {t('roleSelection.tutor')}
                    </button>
                  )}
                  {roles.includes('ADMIN') && (
                    <button
                      onClick={() => setSelectedRole('ADMIN')}
                      className={`w-full px-6 py-4 rounded-xl font-semibold text-base transition-all transform ${
                        selectedRole === 'ADMIN'
                          ? 'bg-gradient-to-r from-brand-green to-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 text-brand-dark hover:bg-gray-100 hover:shadow-md border border-gray-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                      {t('roleSelection.admin')}
                    </button>
                  )}

                  <button
                    onClick={handleProceed}
                    disabled={!selectedRole}
                    className="w-full mt-6 px-6 py-4 bg-brand-dark text-white rounded-xl font-semibold text-base hover:bg-opacity-90 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {t('roleSelection.proceed')} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
