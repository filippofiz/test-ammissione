import { useState, useEffect } from 'react';

interface DiagnosticResult {
  status: 'checking' | 'good' | 'warning' | 'error';
  message: string;
  value?: number;
}

interface DiagnosticsState {
  connection: DiagnosticResult;
  performance: DiagnosticResult;
  overall: 'checking' | 'ready' | 'warning' | 'error';
}

interface PreTestDiagnosticsProps {
  supabaseUrl: string;
  supabaseKey: string;
  onDiagnosticsComplete?: (results: DiagnosticsState) => void;
}

export function PreTestDiagnostics({ supabaseUrl, supabaseKey, onDiagnosticsComplete }: PreTestDiagnosticsProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    connection: { status: 'checking', message: 'Checking connection...' },
    performance: { status: 'checking', message: 'Testing device performance...' },
    overall: 'checking'
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    setDiagnostics({
      connection: { status: 'checking', message: 'Checking connection...' },
      performance: { status: 'checking', message: 'Testing device performance...' },
      overall: 'checking'
    });

    const results: DiagnosticsState = {
      connection: { status: 'checking', message: '' },
      performance: { status: 'checking', message: '' },
      overall: 'checking'
    };

    // Test 1: Connection & Speed (combined)
    try {
      const times: number[] = [];

      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: { 'apikey': supabaseKey },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        times.push(performance.now() - start);
      }

      const avgLatency = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      console.log('🌐 Network latency:', avgLatency, 'ms');

      if (avgLatency < 400) {
        results.connection = { status: 'good', message: 'Connection stable', value: avgLatency };
      } else if (avgLatency < 1000) {
        results.connection = { status: 'warning', message: 'Slow connection — you may experience delays', value: avgLatency };
      } else {
        results.connection = { status: 'error', message: 'Poor connection — saving and loading may be unreliable', value: avgLatency };
      }
    } catch (error) {
      results.connection = { status: 'error', message: 'Unable to connect — check your internet connection' };
    }

    setDiagnostics(prev => ({ ...prev, connection: results.connection }));

    // Test 2: Device Performance (CPU benchmark)
    try {
      const start = performance.now();
      let result = 0;

      // CPU benchmark - mathematical operations
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i) * Math.sin(i);
      }

      const cpuTime = performance.now() - start;
      console.log('🖥️ CPU benchmark:', Math.round(cpuTime), 'ms');

      if (cpuTime < 50) {
        results.performance = { status: 'good', message: 'Excellent performance', value: cpuTime };
      } else if (cpuTime < 150) {
        results.performance = { status: 'good', message: 'Good performance', value: cpuTime };
      } else if (cpuTime < 400) {
        results.performance = { status: 'warning', message: 'Slow device — some features may feel sluggish', value: cpuTime };
      } else {
        results.performance = { status: 'error', message: 'Device too slow — the test may freeze or crash', value: cpuTime };
      }
    } catch (error) {
      results.performance = { status: 'warning', message: 'Test non completato' };
    }

    setDiagnostics(prev => ({ ...prev, performance: results.performance }));

    // Calculate overall status
    const statuses = [results.connection.status, results.performance.status];
    if (statuses.includes('error')) {
      results.overall = 'error';
    } else if (statuses.includes('warning')) {
      results.overall = 'warning';
    } else {
      results.overall = 'ready';
    }

    setDiagnostics({ ...results });
    onDiagnosticsComplete?.(results);
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'checking':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'good':
        return <span className="text-green-500 text-xl">✓</span>;
      case 'warning':
        return <span className="text-yellow-500 text-xl">⚠️</span>;
      case 'error':
        return <span className="text-red-500 text-xl">✗</span>;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const getOverallMessage = () => {
    switch (diagnostics.overall) {
      case 'checking':
        return { text: 'Running diagnostics...', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'ready':
        return { text: 'All good! You can start the test.', color: 'text-green-600', bg: 'bg-green-100' };
      case 'warning':
        return { text: 'Issues detected. Your test experience might not be optimal.', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'error':
        return { text: 'Several issues detected. The test may run poorly or crash unexpectedly. We recommend closing other apps and checking your connection before proceeding.', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  const overall = getOverallMessage();

  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔍 System Check
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Connection & Speed */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getStatusColor(diagnostics.connection.status)}`}
        >
          {getStatusIcon(diagnostics.connection.status)}
          <div className="flex-1">
            <div className="font-semibold text-gray-700">Network Connection</div>
            <div className="text-sm text-gray-600">{diagnostics.connection.message}</div>
          </div>
          {diagnostics.connection.value && (
            <div className="relative group">
              <span className="text-gray-400 hover:text-gray-600 cursor-help">ℹ️</span>
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Latency: {Math.round(diagnostics.connection.value)}ms
              </div>
            </div>
          )}
        </div>

        {/* Device Performance */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getStatusColor(diagnostics.performance.status)}`}
        >
          {getStatusIcon(diagnostics.performance.status)}
          <div className="flex-1">
            <div className="font-semibold text-gray-700">Device Performance</div>
            <div className="text-sm text-gray-600">{diagnostics.performance.message}</div>
          </div>
          {diagnostics.performance.value && (
            <div className="relative group">
              <span className="text-gray-400 hover:text-gray-600 cursor-help">ℹ️</span>
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Benchmark: {Math.round(diagnostics.performance.value)}ms
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg ${overall.bg}`}>
        <p className={`font-semibold text-center ${overall.color}`}>
          {overall.text}
        </p>
      </div>

      {/* Re-run button */}
      {diagnostics.overall !== 'checking' && (
        <button
          onClick={runDiagnostics}
          className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Run again
        </button>
      )}
    </div>
  );
}
