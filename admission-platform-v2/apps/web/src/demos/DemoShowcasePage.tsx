import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface DemoCard {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

const DEMOS: DemoCard[] = [
  // Test Results
  {
    id: 'results-score',
    title: 'Score Reveal',
    description: 'Watch the 90% score come alive with confetti',
    category: 'Test Results',
    duration: '~12s',
    color: '#00a666',
    gradient: 'from-[#00a666] to-emerald-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'results-time',
    title: 'Time Management',
    description: 'See pacing analysis charts animate in',
    category: 'Test Results',
    duration: '~12s',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'results-questions',
    title: 'Question Review',
    description: 'Browse detailed question feedback with answers',
    category: 'Test Results',
    duration: '~15s',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  // Test Taking
  {
    id: 'test-answer',
    title: 'Answering Questions',
    description: 'Experience the test interface in action',
    category: 'Test Taking',
    duration: '~14s',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  },
  {
    id: 'test-nav',
    title: 'Navigation & Tools',
    description: 'Calculator, flags, and question navigator',
    category: 'Test Taking',
    duration: '~12s',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-teal-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'test-submit',
    title: 'Submission Flow',
    description: 'The satisfying test completion experience',
    category: 'Test Taking',
    duration: '~11s',
    color: '#10B981',
    gradient: 'from-emerald-500 to-green-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  },
  // Student Experience
  {
    id: 'student-dashboard',
    title: 'Learning Journey',
    description: 'Student\'s personalized dashboard with tracks',
    category: 'Student Experience',
    duration: '~10s',
    color: '#3B82F6',
    gradient: 'from-blue-600 to-indigo-600',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    id: 'student-unlock',
    title: 'Test Unlock',
    description: 'The exciting unlock animation moment',
    category: 'Student Experience',
    duration: '~8s',
    color: '#F59E0B',
    gradient: 'from-yellow-500 to-amber-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>,
  },
  // Tutor Dashboard
  {
    id: 'analytics-overview',
    title: 'Student Monitoring',
    description: 'Monitor 8 students with urgency levels',
    category: 'Tutor Dashboard',
    duration: '~13s',
    color: '#EF4444',
    gradient: 'from-red-500 to-rose-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
  {
    id: 'analytics-deepdive',
    title: 'Student Deep Dive',
    description: 'Track individual improvement with charts',
    category: 'Tutor Dashboard',
    duration: '~10s',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  // GMAT
  {
    id: 'gmat-score',
    title: 'GMAT Score Reveal',
    description: 'The 720 GMAT score with percentile',
    category: 'GMAT',
    duration: '~12s',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-violet-600',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
  {
    id: 'gmat-prep',
    title: 'GMAT Preparation',
    description: 'Complete GMAT prep journey overview',
    category: 'GMAT',
    duration: '~9s',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-pink-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  // Platform Power
  {
    id: 'question-gallery',
    title: 'Question Types',
    description: '6 supported question formats showcased',
    category: 'Platform Power',
    duration: '~14s',
    color: '#06B6D4',
    gradient: 'from-teal-500 to-cyan-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  },
  {
    id: 'ai-validation',
    title: 'AI Validation',
    description: 'AI-powered quality assurance in action',
    category: 'Platform Power',
    duration: '~13s',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  },
  // Exam Simulations
  {
    id: 'sim-tolc-i',
    title: 'TOLC-I Simulation',
    description: 'Matematica & Logica — auto-answers 5 questions',
    category: 'Exam Simulations',
    duration: '~14s',
    color: '#2563EB',
    gradient: 'from-blue-600 to-blue-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  },
  {
    id: 'sim-tolc-med',
    title: 'TOLC-MED Simulation',
    description: 'Biologia & Chimica — realistic exam interface',
    category: 'Exam Simulations',
    duration: '~14s',
    color: '#059669',
    gradient: 'from-emerald-600 to-green-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  },
  {
    id: 'sim-tolc-e',
    title: 'TOLC-E Simulation',
    description: 'Logica & Comprensione del testo',
    category: 'Exam Simulations',
    duration: '~14s',
    color: '#7C3AED',
    gradient: 'from-violet-600 to-purple-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    id: 'sim-gmat',
    title: 'GMAT Simulation',
    description: 'Data Sufficiency & Quantitative in English',
    category: 'Exam Simulations',
    duration: '~14s',
    color: '#4F46E5',
    gradient: 'from-indigo-600 to-indigo-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
  {
    id: 'sim-sat',
    title: 'SAT Simulation',
    description: 'Reading, Writing & Math — SAT format',
    category: 'Exam Simulations',
    duration: '~14s',
    color: '#DC2626',
    gradient: 'from-red-600 to-red-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  // Test Prep
  {
    id: 'prep-comparison',
    title: 'Attempts Comparison',
    description: 'Overlay 3 attempts with improvement chart',
    category: 'Test Prep',
    duration: '~12s',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
  },
  {
    id: 'prep-report',
    title: 'End-of-Path Report',
    description: 'Complete preparation summary with mastery',
    category: 'Test Prep',
    duration: '~14s',
    color: '#00a666',
    gradient: 'from-[#00a666] to-emerald-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  },
];

const CATEGORIES = ['Test Results', 'Test Taking', 'Student Experience', 'Tutor Dashboard', 'GMAT', 'Platform Power', 'Exam Simulations', 'Test Prep'];

export default function DemoShowcasePage() {
  const navigate = useNavigate();

  return (
    <Layout pageTitle="Demo Showcase" pageSubtitle="Marketing video recordings">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Demo Showcase</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Click any demo, hit Play, and record your screen. Each demo auto-animates through the feature
              so you get a perfect marketing video.
            </p>
          </div>

          {/* Categories */}
          {CATEGORIES.map((category) => {
            const categoryDemos = DEMOS.filter(d => d.category === category);
            return (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: categoryDemos[0]?.color }} />
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDemos.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => navigate(`/admin/demo-showcase/${demo.id}`)}
                      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent text-left overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${demo.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-14 h-14 bg-gradient-to-br ${demo.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                            {demo.icon}
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                            {demo.duration}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-gray-900">
                          {demo.title}
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-gray-600">
                          {demo.description}
                        </p>

                        {/* Play hint */}
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: demo.color }}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Open Demo
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
