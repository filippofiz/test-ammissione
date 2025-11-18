/**
 * Home Page - Role-based routing
 * Detects user role and shows appropriate dashboard
 * TUTOR/ADMIN → TutorSelectionPage
 * STUDENT → StudentHomePage (TODO)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { getCurrentProfile } from '../lib/auth';
import TutorSelectionPage from './TutorSelectionPage';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    detectUserRole();
  }, []);

  async function detectUserRole() {
    const profile = await getCurrentProfile();

    if (!profile) {
      navigate('/login', { replace: true });
      return;
    }

    const roles = (profile.roles as string[]) || [];

    // Determine primary role
    if (roles.includes('TUTOR') || roles.includes('ADMIN')) {
      setUserRole('TUTOR');
    } else if (roles.includes('STUDENT')) {
      setUserRole('STUDENT');
    } else {
      setUserRole('UNKNOWN');
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Render appropriate dashboard based on role
  if (userRole === 'TUTOR') {
    return <TutorSelectionPage />;
  }

  if (userRole === 'STUDENT') {
    // Redirect to student home
    navigate('/student/home', { replace: true });
    return null;
  }

  // Unknown role
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('home.title')}</h1>
          <p className="text-gray-600 text-lg">
            {t('home.welcome')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
