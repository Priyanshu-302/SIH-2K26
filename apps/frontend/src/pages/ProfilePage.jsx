import React, { useState } from 'react';
import { 
  User, Mail, Building, Award, ShieldCheck, Settings, 
  BookMarked, FileText, CheckCircle2, Sliders, Bell, 
  ExternalLink, Key, Sparkles, Scale, Save
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useUIStore } from '../store/uiStore';

export default function ProfilePage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState('credentials');
  
  // Profile state
  const [profile, setProfile] = useState({
    name: 'Dr. Aarav Sharma',
    email: 'a.sharma@ipindia.gov.in',
    designation: 'Senior Patent Examiner & Legal Counsel',
    department: 'Ayurveda & Traditional Knowledge Classification Division',
    organization: 'Indian Patent Office (IPO) • Ministry of AYUSH Advisory Cell',
    examinerId: 'IPO-IN-2026-8842',
    jurisdiction: 'New Delhi / Northern Regional Registry',
    phone: '+91 11 2345 6789',
    specializations: [
      'Polyherbal Synergy Formulation Analysis',
      'Charaka & Sushruta Samhita Prior Art',
      'Section 3(p) & 3(e) Statutory Compliance',
      'TKDL Ontological Cross-Verification',
      'Phytochemical Extraction Methods'
    ]
  });

  // Verification & Preference settings
  const [settings, setSettings] = useState({
    confidenceThreshold: 85,
    languagePreference: 'bilingual', // 'devanagari' | 'iast' | 'bilingual'
    autoCheckSynergy: true,
    enableGazetteAlerts: true,
    strictTkdlFilter: true,
    exportFormat: 'pdf'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast({ type: 'success', message: 'Examiner profile and credentials updated successfully.' });
  };

  const handleSavePreferences = () => {
    addToast({ type: 'success', message: 'AI Verification and Citation preferences saved.' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Profile Header Card */}
      <div className="light-panel rounded-3xl p-6 sm:p-8 shadow-elevated border border-sage-200/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ayur-600 to-ayur-800 text-white flex items-center justify-center text-2xl font-bold font-heading shadow-glow-mint shrink-0 border-2 border-white">
              AS
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold font-heading text-slate-900 leading-tight">
                  {profile.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified IPO Examiner</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-ayur-800">
                {profile.designation}
              </p>
              <p className="text-xs text-slate-500">
                {profile.organization}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none text-xs"
              onClick={() => setActiveTab('preferences')}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span>AI Preferences</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 md:flex-none bg-ayur-700 hover:bg-ayur-800 text-white text-xs shadow-soft-card"
              onClick={() => addToast({ type: 'info', message: 'Downloading complete Examiner Audit Dossier (PDF)...' })}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>Export Dossier</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-sage-100">
          <div className="bg-alabaster-50 p-3.5 rounded-2xl border border-sage-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Queries Processed
            </span>
            <span className="text-xl font-bold font-heading text-slate-900 mt-0.5 block">
              284
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">↑ 18 this month</span>
          </div>

          <div className="bg-alabaster-50 p-3.5 rounded-2xl border border-sage-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              § 3(p) Citations Issued
            </span>
            <span className="text-xl font-bold font-heading text-slate-900 mt-0.5 block">
              1,412
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">TKDL Verified</span>
          </div>

          <div className="bg-alabaster-50 p-3.5 rounded-2xl border border-sage-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Manuscripts Indexed
            </span>
            <span className="text-xl font-bold font-heading text-slate-900 mt-0.5 block">
              956
            </span>
            <span className="text-[10px] text-ayur-700 font-semibold">Charaka & Sushruta</span>
          </div>

          <div className="bg-alabaster-50 p-3.5 rounded-2xl border border-sage-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Retrieval Accuracy
            </span>
            <span className="text-xl font-bold font-heading text-slate-900 mt-0.5 block">
              97.4%
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">High Confidence</span>
          </div>
        </div>
      </div>

      {/* Main Content Area with Responsive Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tab Buttons (Mobile horizontally scrollable, Desktop vertical list) */}
        <div className="lg:col-span-3 light-card rounded-2xl p-2.5 flex lg:flex-col overflow-x-auto gap-1 border border-sage-100">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left w-full ${
              activeTab === 'credentials'
                ? 'bg-ayur-700 text-white shadow-soft-card'
                : 'text-slate-600 hover:bg-sage-50 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Examiner Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left w-full ${
              activeTab === 'preferences'
                ? 'bg-ayur-700 text-white shadow-soft-card'
                : 'text-slate-600 hover:bg-sage-50 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>AI Reasoning & Citations</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left w-full ${
              activeTab === 'history'
                ? 'bg-ayur-700 text-white shadow-soft-card'
                : 'text-slate-600 hover:bg-sage-50 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-4 h-4 shrink-0" />
            <span>Saved Prior Art Claims</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left w-full ${
              activeTab === 'security'
                ? 'bg-ayur-700 text-white shadow-soft-card'
                : 'text-slate-600 hover:bg-sage-50 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4 shrink-0" />
            <span>Security & Access Tokens</span>
          </button>
        </div>

        {/* Tab Detail Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="light-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-sage-100">
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    Official Examiner Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registered identifier in the Indian Intellectual Property Office Directory.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-ayur-700 bg-ayur-50 px-3 py-1 rounded-lg border border-ayur-200">
                  {profile.examinerId}
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Official Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Designation / Role</label>
                    <input
                      type="text"
                      value={profile.designation}
                      onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                      className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Patent Jurisdiction & Registry</label>
                    <input
                      type="text"
                      value={profile.jurisdiction}
                      onChange={(e) => setProfile({ ...profile, jurisdiction: e.target.value })}
                      className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Ayurvedic Domain Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-50 text-slate-800 border border-sage-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-ayur-600" />
                        <span>{spec}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-ayur-700 hover:bg-ayur-800 text-white text-xs px-5">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Credentials</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 2. AI Reasoning & Verification Preferences */}
          {activeTab === 'preferences' && (
            <div className="light-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-sage-100">
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  AI Legal Reasoning & Citation Parameters
                </h3>
                <p className="text-xs text-slate-500">
                  Configure retrieval confidence thresholds and classical scripture citation formatting.
                </p>
              </div>

              <div className="space-y-5">
                {/* Confidence Threshold Slider */}
                <div className="p-4 bg-alabaster-50 rounded-2xl border border-sage-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-ayur-600" />
                      <span>Minimum RAG Retrieval Confidence Threshold</span>
                    </span>
                    <span className="font-mono text-ayur-800 bg-ayur-100 px-2.5 py-0.5 rounded-md">
                      {settings.confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="98"
                    value={settings.confidenceThreshold}
                    onChange={(e) => setSettings({ ...settings, confidenceThreshold: Number(e.target.value) })}
                    className="w-full accent-ayur-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Citations with similarity scores below {settings.confidenceThreshold}% will trigger an amber low-confidence warning.
                  </p>
                </div>

                {/* Classical Verse Display Language */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Classical Sanskrit Verse Display Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setSettings({ ...settings, languagePreference: 'bilingual' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        settings.languagePreference === 'bilingual'
                          ? 'bg-ayur-50 border-ayur-500 text-ayur-900 font-semibold shadow-sm'
                          : 'bg-white border-sage-200 text-slate-700 hover:bg-sage-50'
                      }`}
                    >
                      <p className="font-bold">Bilingual (Recommended)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Devanagari + English statutory translation</p>
                    </div>

                    <div
                      onClick={() => setSettings({ ...settings, languagePreference: 'devanagari' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        settings.languagePreference === 'devanagari'
                          ? 'bg-ayur-50 border-ayur-500 text-ayur-900 font-semibold shadow-sm'
                          : 'bg-white border-sage-200 text-slate-700 hover:bg-sage-50'
                      }`}
                    >
                      <p className="font-bold">Devanagari Original</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pure Sanskrit script from Samhitas</p>
                    </div>

                    <div
                      onClick={() => setSettings({ ...settings, languagePreference: 'iast' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        settings.languagePreference === 'iast'
                          ? 'bg-ayur-50 border-ayur-500 text-ayur-900 font-semibold shadow-sm'
                          : 'bg-white border-sage-200 text-slate-700 hover:bg-sage-50'
                      }`}
                    >
                      <p className="font-bold">IAST Romanized</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Phonetic Latin transliteration</p>
                    </div>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-sage-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Automated Section 3(e) Aggregation Checks</p>
                      <p className="text-[10px] text-slate-500">Flag claims lacking proven synergistic non-additive therapeutic data.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoCheckSynergy}
                      onChange={(e) => setSettings({ ...settings, autoCheckSynergy: e.target.checked })}
                      className="w-4 h-4 accent-ayur-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-sage-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Direct TKDL Vector Filtering</p>
                      <p className="text-[10px] text-slate-500">Enforce strict vector distance filters on classical formulation databases.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.strictTkdlFilter}
                      onChange={(e) => setSettings({ ...settings, strictTkdlFilter: e.target.checked })}
                      className="w-4 h-4 accent-ayur-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSavePreferences} className="bg-ayur-700 hover:bg-ayur-800 text-white text-xs px-5">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Apply AI Parameters</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Saved Prior Art Claims Tab */}
          {activeTab === 'history' && (
            <div className="light-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-sage-100">
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900">
                    Bookmarked Prior Art Precedents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved statutory analyses, classical extracts, and Section 3(p) objections.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">3 Saved Claims</span>
              </div>

              <div className="space-y-3">
                <div className="light-card rounded-xl p-4 border border-sage-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Polyherbal Synergistic Extract: Guduchi + Yestimadhu
                      </h4>
                      <p className="text-[11px] font-mono text-ayur-700 font-semibold mt-0.5">
                        Statute: Section 3(p) & Section 3(e)
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      96% High Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic font-serif">
                    "Decoction cited in Charaka Samhita Sutrasthana (TKDL/CS/SS/145) for rasayana and anti-inflammatory action."
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-sage-100">
                    <span>Saved on 28 Aug 2026</span>
                    <button 
                      onClick={() => addToast({ type: 'info', message: 'Opening saved assessment dossier in workspace...' })}
                      className="text-ayur-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open in Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="light-card rounded-xl p-4 border border-sage-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Neem (Azadirachta indica) Topical Gel Formulation
                      </h4>
                      <p className="text-[11px] font-mono text-ayur-700 font-semibold mt-0.5">
                        Statute: Section 3(p) Traditional Knowledge
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      94% High Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic font-serif">
                    "Anticipated in Sushruta Samhita Chikitsasthana; standard topical application for dermatological cleansing."
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-sage-100">
                    <span>Saved on 24 Aug 2026</span>
                    <button 
                      onClick={() => addToast({ type: 'info', message: 'Opening saved assessment dossier in workspace...' })}
                      className="text-ayur-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open in Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Security Tab */}
          {activeTab === 'security' && (
            <div className="light-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-sage-100">
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Government Examiner Access Tokens
                </h3>
                <p className="text-xs text-slate-500">
                  Secure API keys for automated Indian Patent Office pipeline integrations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-alabaster-50 rounded-xl border border-sage-100 space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Active Examiner API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value="ayur_live_sec_9938210948a07d2f"
                      readOnly
                      className="flex-1 text-xs font-mono bg-white border border-sage-200 rounded-xl p-2.5 text-slate-700"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addToast({ type: 'success', message: 'API key copied to clipboard' })}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-sage-50 rounded-xl border border-sage-200 text-xs text-slate-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    All patent claim evaluation streams are end-to-end encrypted under the <strong>Indian Biological Diversity Data Framework</strong> and IPO confidential evaluation guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
