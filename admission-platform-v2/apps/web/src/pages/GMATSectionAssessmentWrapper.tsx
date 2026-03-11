/**
 * GMATSectionAssessmentWrapper
 *
 * Thin guard page for GMAT section assessments (QR / DI / VR).
 * Checks section lock status then redirects to TakeTestPage GMAT fork.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentProfile } from '../lib/auth';
import { getStudentGMATProgress, type GmatSection } from '../lib/api/gmat';

const VALID_SECTIONS: GmatSection[] = ['QR', 'DI', 'VR'];

const SECTION_LOCK_FIELD: Record<GmatSection, 'section_qr_locked' | 'section_di_locked' | 'section_vr_locked'> = {
  QR: 'section_qr_locked',
  DI: 'section_di_locked',
  VR: 'section_vr_locked',
};

export default function GMATSectionAssessmentWrapper() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAndRedirect() {
      const gmatSection = section?.toUpperCase() as GmatSection | undefined;

      if (!gmatSection || !VALID_SECTIONS.includes(gmatSection)) {
        navigate('/student/gmat-preparation');
        return;
      }

      const profile = await getCurrentProfile();
      if (!profile) {
        navigate('/login');
        return;
      }

      const progress = await getStudentGMATProgress(profile.id).catch(() => null);

      if (!progress?.gmat_cycle) {
        // No cycle assigned yet — placement first
        navigate('/student/gmat-preparation');
        return;
      }

      const lockField = SECTION_LOCK_FIELD[gmatSection];
      if (progress[lockField]) {
        setError(`The ${gmatSection} section assessment is currently locked.`);
        return;
      }

      navigate(`/take-test/gmat/section/${gmatSection}`);
    }

    checkAndRedirect();
  }, [navigate, section]);

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
