import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { getCurrentProfile, signOut } from '../lib/auth';
// Import from full generated Supabase types
import type { Database } from '../../database.types';

type Profile = Database['public']['Tables']['2V_profiles']['Row'];

interface LayoutProps {
  children: ReactNode;
  noScroll?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function Layout({ children, noScroll = false, pageTitle, pageSubtitle }: LayoutProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getCurrentProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error('❌ [Layout] Failed to load profile:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 relative overflow-hidden flex flex-col">
      {/* Animated background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="bg-brand-dark text-white shadow-lg relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo and Page Title */}
            <div className="flex items-center gap-4">
              <img
                src="/logo_bianco_e_verde.png"
                alt="Up to Ten"
                className="h-10 md:h-12 w-auto"
              />
              {pageTitle && (
                <>
                  <div className="hidden md:block w-px h-8 bg-gray-600"></div>
                  <div className="hidden md:block">
                    <h1 className="text-xl font-bold">{pageTitle}</h1>
                    {pageSubtitle && (
                      <p className="text-xs text-gray-300">{pageSubtitle}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {profile && (
                <>
                  {/* Home Button */}
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
                    title="Go to Home"
                  >
                    <FontAwesomeIcon icon={faHome} />
                    <span>Home</span>
                  </button>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                        localStorage.getItem('language') === 'en' || !localStorage.getItem('language')
                          ? 'bg-brand-green text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('it')}
                      className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                        localStorage.getItem('language') === 'it'
                          ? 'bg-brand-green text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      IT
                    </button>
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{profile.name}</p>
                      <p className="text-xs text-gray-300">
                        {Array.isArray(profile.roles) ? (profile.roles as string[]).join(', ') : ''}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-brand-green hover:bg-opacity-90 rounded-lg font-semibold transition-all"
                    >
                      {t('layout.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="space-y-4">
                {/* Home Button */}
                {profile && (
                  <button
                    onClick={() => {
                      navigate('/');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all text-left flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faHome} />
                    <span>Home</span>
                  </button>
                )}

                {/* Language Selector */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Language</p>
                  <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all ${
                        localStorage.getItem('language') === 'en' || !localStorage.getItem('language')
                          ? 'bg-brand-green text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('it')}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all ${
                        localStorage.getItem('language') === 'it'
                          ? 'bg-brand-green text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      IT
                    </button>
                  </div>
                </div>

                {profile && (
                  <>
                    <div>
                      <p className="text-sm font-semibold">{profile.name}</p>
                      <p className="text-xs text-gray-300">
                        {Array.isArray(profile.roles) ? (profile.roles as string[]).join(', ') : ''}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 bg-brand-green hover:bg-opacity-90 rounded-lg font-semibold transition-all text-left"
                    >
                      {t('layout.logout')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col ${noScroll ? 'overflow-hidden' : 'overflow-auto'}`}>{children}</main>
    </div>
  );
}
