/**
 * GMATSimulationWrapper
 *
 * Thin guard page for GMAT mock simulation.
 * Checks simulation_unlocked flag then redirects to TakeTestPage GMAT fork.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';
import { getStudentGMATProgress } from '../lib/api/gmat';

export default function GMATSimulationWrapper() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAndRedirect() {
      const profile = await getCurrentProfile();
      if (!profile) {
        navigate('/login');
        return;
      }

      const progress = await getStudentGMATProgress(profile.id).catch(() => null);

      if (!progress?.simulation_unlocked) {
        setError('The mock simulation is not yet unlocked. Complete your section assessments first.');
        return;
      }

      navigate('/take-test/gmat/simulation');
    }

    checkAndRedirect();
  }, [navigate]);

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
