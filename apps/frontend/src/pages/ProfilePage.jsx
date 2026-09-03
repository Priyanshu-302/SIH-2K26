import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, CheckCircle2, 
  Building2, Award, LogOut, Save, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { updateProfileAPI } from '../services/apiService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { addToast } = useUIStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState('researcher');
  const [organization, setOrganization] = useState('');
  const [researchFocus, setResearchFocus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync component state when user is loaded from store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role || 'researcher');
      setOrganization(user.organization || 'Indian Patent & Ayush Research Cell');
      setResearchFocus(user.researchFocus || 'Ayurvedic Prior Art & Section 3(p) Compliance');
    }
  }, [user]);

  // Compute avatar initials dynamically
  const getInitials = () => {
    if (name) {
      const clean = name.replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').trim();
      const parts = clean.split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return clean.slice(0, 2).toUpperCase();
    }
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'AR';
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update backend if available
      try {
        await updateProfileAPI({ name: name.trim(), role });
      } catch (backendErr) {
        console.warn('Backend update notice:', backendErr.message);
      }

      // 2. Update local auth store & localStorage
      updateUser({
        name: name.trim(),
        role,
        organization: organization.trim(),
        researchFocus: researchFocus.trim(),
      });

      addToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to save profile changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-sage-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-ayur-700 to-ayur-900 text-white flex items-center justify-center text-xl sm:text-2xl font-bold font-heading shadow-soft-md border-2 border-white shrink-0">
              {getInitials()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 leading-tight">
                  {name || user?.name || 'Researcher'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {user?.email || 'user@ayur-ip.gov.in'}
              </p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider bg-sage-100 text-ayur-800">
                  {role === 'examiner' ? 'Patent Examiner' : role === 'attorney' ? 'IP Attorney' : 'Ayurveda Researcher'}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Account Settings Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-card border border-sage-200/80 space-y-6">
        <div>
          <h2 className="text-base font-bold font-heading text-slate-900">Personal & Role Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your name and primary role to customize your Ayur-IP assessments.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Aarav Sharma"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all"
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-slate-400 font-normal">(Verified)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Role / Designation */}
            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designation / Role
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all cursor-pointer"
                >
                  <option value="researcher">Ayurveda Formulation Researcher</option>
                  <option value="examiner">Patent Examiner (Indian Patent Office)</option>
                  <option value="attorney">IP Attorney & Regulatory Counsel</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {/* Organization / Affiliation */}
            <div>
              <label htmlFor="org" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organization / Institution
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Indian Patent Office (IPO) / CSIR-TKDL"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Research Focus */}
          <div>
            <label htmlFor="focus" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Research or Legal Specialization
            </label>
            <input
              id="focus"
              type="text"
              value={researchFocus}
              onChange={(e) => setResearchFocus(e.target.value)}
              placeholder="e.g. Polyherbal Synergies, Section 3(p) Traditional Knowledge Anticipation"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-ayur-600 focus:ring-2 focus:ring-ayur-500/10 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white text-xs sm:text-sm font-semibold shadow-soft-card hover:shadow-soft-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Access Overview Card */}
      <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-sage-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authentication Method</span>
            </h3>
            <p className="text-xs text-slate-500">
              Signed in via passwordless authentication. Session tokens are encrypted and tied strictly to your account.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200 text-xs font-semibold text-ayur-800">
            {user?.authProvider === 'google' ? 'Google Account' : 'Email OTP Verified'}
          </div>
        </div>
      </div>

    </div>
  );
}
