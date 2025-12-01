/**
 * Manage Accounts Page
 * Allows admins to create and manage student and tutor accounts
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate,
  faChalkboardTeacher,
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faSearch,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

interface UserFormData {
  email: string;
  name: string;
  role: 'STUDENT' | 'TUTOR';
  tutor_id?: string;
  esigenze_speciali?: boolean;
  student_ids?: string[]; // For tutors: assign multiple students
}

export default function ManageAccountsPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'STUDENT' | 'TUTOR'>('ALL');
  const [saving, setSaving] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'STUDENT',
    esigenze_speciali: false,
    student_ids: [],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load all profiles
      const { data: profiles, error } = await supabase
        .from('2V_profiles')
        .select('*')
        .order('name');

      if (error) throw error;

      if (profiles) {
        setUsers(profiles);
        // Extract tutors for the dropdown
        const tutorList = profiles.filter(p =>
          Array.isArray(p.roles) && p.roles.includes('TUTOR')
        );
        setTutors(tutorList);
        // Extract students for the multi-select
        const studentList = profiles.filter(p =>
          Array.isArray(p.roles) && p.roles.includes('STUDENT')
        );
        setStudents(studentList);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Generate a temporary password (8 random chars)
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();

      // Create auth user using signUp (works with anon key)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/change-password`,
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from auth creation');
      }

      // Create profile
      const profileData: any = {
        auth_uid: authData.user.id,
        email: formData.email,
        name: formData.name,
        roles: [formData.role],
        must_change_password: true,
      };

      if (formData.role === 'STUDENT') {
        profileData.tutor_id = formData.tutor_id || null;
        profileData.esigenze_speciali = formData.esigenze_speciali || false;
        profileData.tests = [];
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('2V_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // If creating a tutor, assign selected students to this tutor
      if (formData.role === 'TUTOR' && formData.student_ids && formData.student_ids.length > 0) {
        const { error: assignError } = await supabase
          .from('2V_profiles')
          .update({ tutor_id: newProfile.id })
          .in('id', formData.student_ids);

        if (assignError) {
          console.error('Error assigning students:', assignError);
          // Don't fail the whole operation, just warn
          alert(`⚠️ Tutor created but failed to assign some students: ${assignError.message}`);
        }
      }

      // Show success message with temporary password
      const successMsg = formData.role === 'TUTOR' && formData.student_ids && formData.student_ids.length > 0
        ? `✅ Tutor created successfully and assigned to ${formData.student_ids.length} student(s)!\n\nEmail: ${formData.email}\nTemporary Password: ${tempPassword}\n\nPlease save this password and share it with the user. They will be required to change it on first login.`
        : `✅ User created successfully!\n\nEmail: ${formData.email}\nTemporary Password: ${tempPassword}\n\nPlease save this password and share it with the user. They will be required to change it on first login.`;

      alert(successMsg);

      // Reset form and reload
      setFormData({
        email: '',
        name: '',
        role: 'STUDENT',
        esigenze_speciali: false,
        student_ids: [],
      });
      setStudentSearchQuery('');
      setShowAddModal(false);
      loadUsers();
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis will:\n- Delete the user's profile from the database\n- Note: The auth account will remain but cannot log in without a profile\n- This action cannot be undone!`)) {
      return;
    }

    try {
      // Delete from profiles (auth account will remain but cannot log in without profile)
      const { error: profileError } = await supabase
        .from('2V_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      alert('✅ User profile deleted successfully');
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const matchesRole = filterRole === 'ALL' || roles.includes(filterRole);
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getUserRoleBadge = (roles: any) => {
    if (!Array.isArray(roles)) return null;

    return roles.map(role => {
      const colors = {
        STUDENT: 'bg-blue-100 text-blue-800',
        TUTOR: 'bg-green-100 text-green-800',
        ADMIN: 'bg-purple-100 text-purple-800',
      };
      return (
        <span key={role} className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
          {role}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <Layout pageTitle="Manage Accounts">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Manage Accounts" pageSubtitle="Create and manage student and tutor accounts">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Admin Dashboard</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-brand-green to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add User
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-brand-dark">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-gray-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Students</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter(u => Array.isArray(u.roles) && u.roles.includes('STUDENT')).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tutors</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => Array.isArray(u.roles) && u.roles.includes('TUTOR')).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRole('ALL')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterRole === 'ALL'
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRole('STUDENT')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterRole === 'STUDENT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setFilterRole('TUTOR')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterRole === 'TUTOR'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tutors
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tutor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Special Needs</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const tutorName = user.tutor_id
                      ? tutors.find(t => t.id === user.tutor_id)?.name || 'Unknown'
                      : '-';

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {getUserRoleBadge(user.roles)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{tutorName}</td>
                        <td className="px-6 py-4">
                          {user.esigenze_speciali ? (
                            <span className="text-orange-600 font-semibold">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-800 transition-colors ml-3"
                            title="Delete user"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users found matching your filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Add New User</h2>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'STUDENT' | 'TUTOR' })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TUTOR">Tutor</option>
                </select>
              </div>

              {/* Student Selection (only for tutors) */}
              {formData.role === 'TUTOR' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Students (Optional)
                  </label>

                  {/* Search Field */}
                  <div className="mb-2">
                    <div className="relative">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 space-y-2">
                    {students.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No students available</p>
                    ) : (
                      <>
                        {(() => {
                          const filteredStudents = students.filter(student =>
                            student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                            student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
                          );

                          if (filteredStudents.length === 0) {
                            return (
                              <p className="text-sm text-gray-500 text-center py-2">
                                No students found matching "{studentSearchQuery}"
                              </p>
                            );
                          }

                          return filteredStudents.map(student => {
                            const currentTutor = student.tutor_id ? tutors.find(t => t.id === student.tutor_id) : null;
                            const hasExistingTutor = !!currentTutor;

                            return (
                              <label key={student.id} className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer ${hasExistingTutor ? 'bg-amber-50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={formData.student_ids?.includes(student.id)}
                                  onChange={(e) => {
                                    const currentIds = formData.student_ids || [];
                                    if (e.target.checked) {
                                      setFormData({ ...formData, student_ids: [...currentIds, student.id] });
                                    } else {
                                      setFormData({ ...formData, student_ids: currentIds.filter(id => id !== student.id) });
                                    }
                                  }}
                                  className="w-4 h-4 text-brand-green focus:ring-brand-green"
                                />
                                <div className="flex-1">
                                  <div className="text-sm text-gray-700">{student.name} ({student.email})</div>
                                  {hasExistingTutor && (
                                    <div className="text-xs text-amber-600 mt-0.5">
                                      ⚠️ Currently assigned to: {currentTutor.name}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          });
                        })()}
                      </>
                    )}
                  </div>
                  {formData.student_ids && formData.student_ids.length > 0 && (
                    <>
                      <p className="text-xs text-green-600 mt-2">
                        {formData.student_ids.length} student(s) selected
                      </p>
                      {(() => {
                        const selectedWithTutors = formData.student_ids.filter(id =>
                          students.find(s => s.id === id)?.tutor_id
                        );
                        if (selectedWithTutors.length > 0) {
                          return (
                            <p className="text-xs text-amber-600 mt-1">
                              ⚠️ Warning: {selectedWithTutors.length} of the selected student(s) already have tutors assigned. They will be reassigned to this new tutor.
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Tutor Selection (only for students) */}
              {formData.role === 'STUDENT' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign to Tutor (Optional)
                    </label>
                    <select
                      value={formData.tutor_id || ''}
                      onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value || undefined })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none"
                    >
                      <option value="">No tutor assigned</option>
                      {tutors.map(tutor => (
                        <option key={tutor.id} value={tutor.id}>{tutor.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.esigenze_speciali}
                        onChange={(e) => setFormData({ ...formData, esigenze_speciali: e.target.checked })}
                        className="w-4 h-4 text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-sm font-semibold text-gray-700">Special Needs (Esigenze Speciali)</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setFormData({
                    email: '',
                    name: '',
                    role: 'STUDENT',
                    esigenze_speciali: false,
                    student_ids: [],
                  });
                  setStudentSearchQuery('');
                  setShowAddModal(false);
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-green to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              A temporary password will be generated and displayed after creation. The user will be required to change it on first login.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
