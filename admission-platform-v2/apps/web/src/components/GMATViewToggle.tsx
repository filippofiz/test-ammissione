/**
 * GMAT View Toggle Component
 * Allows tutors to toggle between "Tutor View" and "Student Preview"
 * to see exactly what the student would see
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faUserGraduate, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';

interface GMATViewToggleProps {
  viewMode: 'tutor' | 'student';
  onToggle: (mode: 'tutor' | 'student') => void;
}

export function GMATViewToggle({ viewMode, onToggle }: GMATViewToggleProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faEye} className="text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Preview Mode</span>
      </div>

      <div className="flex bg-amber-100 rounded-lg p-1">
        <button
          onClick={() => onToggle('tutor')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'tutor'
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-amber-600 hover:text-amber-800'
          }`}
        >
          <FontAwesomeIcon icon={faChalkboardTeacher} className="text-xs" />
          Tutor View
        </button>
        <button
          onClick={() => onToggle('student')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            viewMode === 'student'
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-amber-600 hover:text-amber-800'
          }`}
        >
          <FontAwesomeIcon icon={faUserGraduate} className="text-xs" />
          Student Preview
        </button>
      </div>
    </div>
  );
}
