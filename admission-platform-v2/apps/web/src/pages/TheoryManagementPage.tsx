/**
 * Theory Management Page — wrapper for TheoryManager.
 * Accessible by tutors and admins to create/edit theory for Semestre Filtro.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBook } from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { TheoryManager } from '../components/semestre-filtro/TheoryManager';

export default function TheoryManagementPage() {
  const navigate = useNavigate();
  const [testType] = useState('SEMESTRE FILTRO');

  return (
    <Layout pageTitle="Theory Management">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FontAwesomeIcon icon={faBook} className="text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">Theory Manager</h1>
              <p className="text-gray-500">Create and edit theory content for {testType}</p>
            </div>
          </div>

          <TheoryManager testType={testType} />
        </div>
      </div>
    </Layout>
  );
}
