/**
 * Test Management Hub Page
 * Central page for all test-related management tasks
 */

import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowsUpDown,
  faCog,
  faFileAlt,
  faBrain,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';

export default function TestManagementPage() {
  const navigate = useNavigate();

  return (
    <Layout pageTitle="Test Management" pageSubtitle="Configure Tests and Settings">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/tutor')}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Tutor Dashboard</span>
          </button>

          {/* Management Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Test Structure Viewer */}
            <button
              onClick={() => navigate('/tutor/test-structure')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-500 transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.05s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faSitemap} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Test Structure
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                View complete test hierarchy with categories and exercises
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  Browse all test types
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  View sections & topics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  See question counts
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Section Order Management */}
            <button
              onClick={() => navigate('/tutor/manage-section-order')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-500 transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.1s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faArrowsUpDown} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Section Order
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                Configure the display order of test sections in the test track
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Drag and drop sections
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Set pedagogical order
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Apply to all students
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Test Track Configuration */}
            <button
              onClick={() => navigate('/tutor/select-test-type')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-green-500 transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-green to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faCog} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Test Settings
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                Configure test durations, scoring, and other settings
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Section order mode
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Time limits & pauses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Navigation settings
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Algorithm Configuration */}
            <button
              onClick={() => navigate('/tutor/algorithm-config')}
              className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-500 transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '0.3s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FontAwesomeIcon icon={faBrain} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Algorithm Configuration
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                Configure adaptive, scoring, and results algorithms
              </p>

              {/* Features List */}
              <ul className="text-left text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Adaptive testing (CAT)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Scoring methods
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Results calculation
                </li>
              </ul>

              {/* Arrow Indicator */}
              <div className="absolute bottom-4 right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Test Reports (Placeholder) */}
            <button
              disabled
              className="group relative bg-white rounded-2xl p-8 shadow-xl transition-all duration-300 border-2 border-gray-100 opacity-60 cursor-not-allowed animate-fadeInUp"
              style={{ animationDelay: '0.4s' }}
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Test Reports
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                View analytics and reports across all tests and students
              </p>

              {/* Coming Soon Badge */}
              <div className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold text-gray-600">
                Coming Soon
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
