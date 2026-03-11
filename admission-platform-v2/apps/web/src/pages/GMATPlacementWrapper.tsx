/**
 * GMATPlacementWrapper
 *
 * Thin guard page for GMAT placement assessment.
 * Checks GMAT-specific preconditions then redirects to TakeTestPage GMAT fork.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';
import {
  getStudentGMATProgress,
  hasPendingPlacementValidation,
} from '../lib/api/gmat';

export default function GMATPlacementWrapper() {
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

      if (progress?.gmat_cycle) {
        navigate('/student/gmat-preparation');
        return;
      }

      const hasPending = await hasPendingPlacementValidation(profile.id).catch(() => false);
      if (hasPending) {
        setError('Your placement assessment has already been submitted and is awaiting tutor review.');
        return;
      }

      navigate('/take-test/gmat/placement');
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
