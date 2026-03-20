/**
 * GMATSimulationWrapper
 *
 * Thin guard page for GMAT mock simulation.
 * Checks simulation_unlocked flag then redirects to TakeTestPage GMAT fork.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';
import { getStudentGMATProgress } from '../lib/api/gmat';

export default function GMATSimulationWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAndRedirect() {
      const profile = await getCurrentProfile();
      if (!profile) {
        navigate('/login');
        return;
      }

      const slotId = searchParams.get('slotId');
      const isPreview = searchParams.get('preview') === 'true';

      // Slot-based access: the slot IS the authorization — bypass the legacy flag check
      if (slotId || isPreview) {
        const params = new URLSearchParams();
        if (slotId) params.set('slotId', slotId);
        if (isPreview) params.set('preview', 'true');
        navigate(`/take-test/gmat-simulation?${params.toString()}`);
        return;
      }

      // Legacy fallback: check the deprecated simulation_unlocked flag
      const progress = await getStudentGMATProgress(profile.id).catch(() => null);
      if (!progress?.simulation_unlocked) {
        setError('The mock simulation is not yet unlocked. Please ask your tutor to unlock a simulation slot.');
        return;
      }

      navigate('/take-test/gmat-simulation');
    }

    checkAndRedirect();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => navigate('/student/gmat-preparation')}
          >
            Back to GMAT Preparation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
