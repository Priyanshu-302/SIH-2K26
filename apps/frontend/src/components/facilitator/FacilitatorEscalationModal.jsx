import React, { useState } from 'react';
import { 
  Building2, X, CheckCircle2, ShieldCheck, FileText, 
  Download, Calendar, UserCheck, Scale, Send, Check,
  Clock, Award, ArrowRight, Printer
} from 'lucide-react';
import { useT } from '../../config/i18n';
import { useUIStore } from '../../store/uiStore';

const FACILITATOR_CENTRES = [
  {
    id: 'pfc_delhi',
    name: 'Ministry of AYUSH Patent Facilitation Centre (PFC)',
    location: 'AYUSH Bhawan, B-Block, GPO Complex, INA, New Delhi - 110023',
    officer: 'Dr. S. K. Sharma (Senior Patent Advisor)',
    specialization: 'Traditional Knowledge & Polyherbal Formulations',
    clearanceTimeline: '5-7 Working Days',
    availableSlots: 'Tomorrow, 11:30 AM'
  },
  {
    id: 'tkdl_cell',
    name: 'CSIR-TKDL Traditional Knowledge Legal Cell',
    location: 'CSIR Complex, Pusa Campus, New Delhi - 110012',
    officer: 'Adv. Meenakshi Sundaram (IP Examiner)',
    specialization: 'TKDL Prior Art Revocation & Section 3(p) Defense',
    clearanceTimeline: '3-5 Working Days',
    availableSlots: 'Thursday, 02:00 PM'
  },
  {
    id: 'rgniipm_nagpur',
    name: 'RGNIIPM National IP Facilitation Cell',
    location: 'Hislop College Road, Civil Lines, Nagpur - 440001',
    officer: 'Shri R. V. Patel (Patent Controller Representative)',
    specialization: 'Form 25 Foreign Filings & Section 39 Clearances',
    clearanceTimeline: '2-4 Working Days',
    availableSlots: 'Friday, 10:00 AM'
  }
];

export function FacilitatorEscalationModal({ isOpen, onClose, conversationSummary = '', jurisdiction = 'national' }) {
  const t = useT();
  const { addToast } = useUIStore();
  const [selectedCentre, setSelectedCentre] = useState('pfc_delhi');
  const [applicantName, setApplicantName] = useState('Dr. Rajesh Verma');
  const [institution, setInstitution] = useState('Indian Patent & Ayush Research Cell (CSIR-TKDL)');
  const [urgency, setUrgency] = useState('standard');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [docketNumber] = useState(() => `AYUR-PFC-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const currentCentre = FACILITATOR_CENTRES.find(c => c.id === selectedCentre) || FACILITATOR_CENTRES[0];

  const handleSubmitEscalation = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    addToast({ type: 'success', message: `Docket ${docketNumber} successfully registered with ${currentCentre.name}.` });
  };

  const handlePrintDocket = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-sage-200 flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 bg-gradient-to-r from-slate-900 via-ayur-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading truncate">
                  AYUSH Patent Facilitator Escalation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Govt Triage
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate hidden sm:block">
                Accelerated examination and traditional knowledge clearance docketing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6 text-xs text-slate-700">
          
          {isSubmitted ? (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-soft-md border-2 border-white">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Consultation Docket Successfully Registered
                </h3>
                <p className="text-slate-500 text-xs">
                  Your formulation evaluation and pre-filled statutory annexures have been assigned to an accredited AYUSH Patent Facilitator.
                </p>
              </div>

              {/* Official Docket Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-left space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">Official Docket Ref</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {docketNumber}
                  </span>
                </div>
                <div className="space-y-1 font-sans text-xs">
                  <p><strong className="text-slate-700">Assigned Center:</strong> {currentCentre.name}</p>
                  <p><strong className="text-slate-700">Designated Officer:</strong> {currentCentre.officer}</p>
                  <p><strong className="text-slate-700">Applicant:</strong> {applicantName} ({institution})</p>
                  <p><strong className="text-slate-700">Attached Annexures:</strong> IPO Form 25 • NBA Form I / III • WIPO GRATK SDS</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={handlePrintDocket}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Docket Sheet</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitEscalation} className="space-y-5">
              
              {/* Docket Overview Strip */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                    Generated Pre-Filing Docket ID
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900">{docketNumber}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Filled Statutory Annexures Attached</span>
                </div>
              </div>

              {/* Select Facilitation Centre */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Select Accredited AYUSH Patent Facilitation Centre (PFC)
                </label>
                <div className="space-y-2.5">
                  {FACILITATOR_CENTRES.map(centre => {
                    const isSelected = selectedCentre === centre.id;
                    return (
                      <div
                        key={centre.id}
                        onClick={() => setSelectedCentre(centre.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-ayur-700 bg-ayur-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs">{centre.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-sage-100 text-ayur-800">
                              {centre.clearanceTimeline}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{centre.location}</p>
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-600">
                            <span>Officer: <strong className="text-slate-800">{centre.officer}</strong></span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Slot: {centre.availableSlots}
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-ayur-700 text-white' : 'border border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Applicant & Institution Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Applicant / Researcher Name
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-ayur-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institution / University / Startup Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-ayur-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white font-bold transition-all shadow-soft-card cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Register Consultation Docket</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
