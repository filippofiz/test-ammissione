/**
 * Admin Dashboard Page
 * Dashboard for administrators with access to:
 * 1. All Tutor functions (Students, Test Management)
 * 2. Admin-specific tools (Test Runner, System Configuration)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate,
  faClipboardList,
  faFlaskVial,
  faCog,
  faChartLine,
  faDatabase,
  faFileCode,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import type { Profile } from '../lib/database.types';

export default function AdminDashboardPage() {
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Dashboard" pageSubtitle="Arched Preparation - Administrator">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Tutor Functions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-3">
              <span className="w-1 h-8 bg-brand-green rounded-full"></span>
              Tutor Functions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students Card */}
              <button
                onClick={() => navigate('/tutor/students')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-brand-green transform hover:scale-105"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Students
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  View and manage students, assign tests, track progress, and view results
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                    View student list
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                    Assign and unlock tests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
                    Track progress and results
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
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-500 transform hover:scale-105"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faClipboardList} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Test Management
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  Configure test settings, manage section order, and control test availability
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Manage section order
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Configure test settings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Control availability
                  </li>
                </ul>

                {/* Arrow Indicator */}
                <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Tools Section */}
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-3">
              <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
              Admin Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Test Runner Card */}
              <button
                onClick={() => navigate('/admin/test-runner')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-500 transform hover:scale-105"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faFlaskVial} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Test Runner
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  Comprehensive testing system to validate platform integrity
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Simulate test scenarios
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Validate data integrity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Generate reports
                  </li>
                </ul>

                {/* Arrow Indicator */}
                <div className="absolute bottom-4 right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* PDF to LaTeX Converter Card */}
              <button
                onClick={() => navigate('/admin/pdf-to-latex')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-indigo-500 transform hover:scale-105"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faFileCode} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  PDF to LaTeX
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  Extract questions from PDFs and convert to LaTeX format
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    AI-powered extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    LaTeX conversion
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    Save to database
                  </li>
                </ul>

                {/* Arrow Indicator */}
                <div className="absolute bottom-4 right-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Review Questions Card */}
              <button
                onClick={() => navigate('/admin/review-questions')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-teal-500 transform hover:scale-105"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FontAwesomeIcon icon={faListCheck} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Review Questions
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  Review and edit questions uploaded to the database
                </p>

                {/* Features List */}
                <ul className="text-left text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    View test questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    Compare with PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    Edit and validate
                  </li>
                </ul>

                {/* Arrow Indicator */}
                <div className="absolute bottom-4 right-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* System Analytics Card */}
              <button
                onClick={() => navigate('/admin/analytics')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-500 transform hover:scale-105 opacity-60 cursor-not-allowed"
                disabled
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faChartLine} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Analytics
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  View system-wide statistics and performance metrics
                </p>

                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
              </button>

              {/* System Configuration Card */}
              <button
                onClick={() => navigate('/admin/settings')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-500 transform hover:scale-105 opacity-60 cursor-not-allowed"
                disabled
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faCog} className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  Settings
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  Configure system-wide settings and preferences
                </p>

                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Coming Soon
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
