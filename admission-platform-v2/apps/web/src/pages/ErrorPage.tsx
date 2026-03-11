import { useLocation, useNavigate } from 'react-router-dom';

type ErrorType = 'crash' | 'auth' | 'not-found';

interface ErrorPageState {
  type?: ErrorType;
  message?: string;
  errorName?: string;
  componentStack?: string;
  timestamp?: string;
}

interface ErrorPageProps {
  previewState?: ErrorPageState;
}

const CONFIG: Record<ErrorType, { icon: string; title: string; description: string; primaryLabel: string; primaryAction: (navigate: ReturnType<typeof useNavigate>) => void }> = {
  crash: {
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Your progress has been saved. Try reloading — if the problem persists, contact support.',
    primaryLabel: 'Reload page',
    primaryAction: () => window.location.reload(),
  },
  auth: {
    icon: '🔒',
    title: 'Session expired',
    description: 'Your session could not be verified. Please log in again to continue.',
    primaryLabel: 'Go to login',
    primaryAction: (navigate) => navigate('/login', { replace: true }),
  },
  'not-found': {
    icon: '🔍',
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has been moved.',
    primaryLabel: 'Go home',
    primaryAction: (navigate) => navigate('/', { replace: true }),
  },
};

export default function ErrorPage({ previewState }: ErrorPageProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = previewState ?? (location.state ?? {}) as ErrorPageState;
  const type: ErrorType = state.type ?? 'not-found';
  const config = CONFIG[type];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Main card */}
        <div className="text-center px-8 py-12 bg-white rounded-2xl shadow-lg mb-4">
          <div className="text-6xl mb-6">{config.icon}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{config.title}</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">{config.description}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => config.primaryAction(navigate)}
              className="px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              {config.primaryLabel}
            </button>
            {type === 'crash' && (
              <button
                onClick={() => navigate('/', { replace: true })}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Go home
              </button>
            )}
          </div>
        </div>

        {/* Technical details — always expanded when present */}
        {state.message && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 py-4 bg-red-50 border-b border-red-100">
              <span className="text-red-500 font-mono text-sm font-semibold">
                {state.errorName ?? 'Error'}
              </span>
              {state.timestamp && (
                <span className="ml-auto text-xs text-gray-400 font-mono">{state.timestamp}</span>
              )}
            </div>

            {/* Error message */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
              <p className="font-mono text-sm text-red-600 break-all">{state.message}</p>
            </div>

            {/* Component stack */}
            {state.componentStack && (
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Component stack</p>
                <pre className="font-mono text-xs text-gray-600 bg-gray-50 rounded-lg p-4 overflow-auto max-h-56 whitespace-pre leading-relaxed">
                  {state.componentStack.trim()}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
