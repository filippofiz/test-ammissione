/**
 * Tutor Selection Page
 * Initial page for tutors to choose between:
 * 1. Managing Students
 * 2. Managing Tests
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentProfile } from '../lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate,
  faClipboardList,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

export default function TutorSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userProfile = await getCurrentProfile();
    setProfile(userProfile);
    setLoading(false);
  }

  const roles = (profile?.roles as string[]) || [];
  const isAdmin = roles.includes('ADMIN');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={t('tutorSelection.title')} pageSubtitle={t('tutorSelection.subtitle')}>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full">

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Students Card */}
            <button
              onClick={() => navigate('/tutor/students')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-green transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.1s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faUserGraduate} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                {t('tutorSelection.students')}
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                {t('tutorSelection.studentsDesc')}
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                  {t('tutorSelection.studentFeatures.viewList')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                  {t('tutorSelection.studentFeatures.assignTests')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                  {t('tutorSelection.studentFeatures.trackProgress')}
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Test Management Card */}
            <button
              onClick={() => navigate('/tutor/test-management')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-500 transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                {t('tutorSelection.testManagement')}
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                {t('tutorSelection.testManagementDesc')}
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {t('tutorSelection.testMgmtFeatures.manageSectionOrder')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {t('tutorSelection.testMgmtFeatures.configureSettings')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {t('tutorSelection.testMgmtFeatures.controlAvailability')}
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Admin Dashboard Card - Only for Admins - Full Width */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-500 transform hover:scale-105 animate-fadeInUp md:col-span-2"
                style={{ animationDelay: '0.3s' }}
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faUserShield} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-brand-dark mb-3">
                  {t('tutorSelection.adminDashboard')}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {t('tutorSelection.adminDashboardDesc')}
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2 max-w-2xl mx-auto">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    {t('tutorSelection.adminFeatures.manageUsers')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    {t('tutorSelection.adminFeatures.systemConfig')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    {t('tutorSelection.adminFeatures.fullAccess')}
                  </li>
                </ul>

                {/* Arrow Indicator */}
                <div className="absolute bottom-4 right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
