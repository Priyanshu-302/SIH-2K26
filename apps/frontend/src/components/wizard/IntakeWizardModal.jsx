import React, { useState } from 'react';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, ArrowRight, 
  Check, Leaf, FlaskConical, Scale, Globe2, ShieldCheck, 
  CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useChatStream } from '../../hooks/useChatStream';
import { useSession } from '../../hooks/useSession';
import { useT } from '../../config/i18n';

const BOTANICAL_OPTIONS = [
  { id: 'ashwagandha', name: 'Ashwagandha', latin: 'Withania somnifera', part: 'Root extract', klass: 'Charaka Rasayana' },
  { id: 'brahmi', name: 'Brahmi', latin: 'Bacopa monnieri', part: 'Whole plant', klass: 'Medhya Rasayana' },
  { id: 'neem', name: 'Neem', latin: 'Azadirachta indica', part: 'Leaf / Seed oil', klass: 'Kusthaghna' },
  { id: 'tulsi', name: 'Tulsi', latin: 'Ocimum sanctum', part: 'Leaf essential oil', klass: 'Kasaswasahara' },
  { id: 'turmeric', name: 'Haridra (Turmeric)', latin: 'Curcuma longa', part: 'Rhizome (Curcuminoids)', klass: 'Varnya / Vishaghna' },
  { id: 'ginger', name: 'Shunti (Ginger)', latin: 'Zingiber officinale', part: 'Rhizome extract', klass: 'Trikatu Deepana' },
  { id: 'pippali', name: 'Pippali', latin: 'Piper longum', part: 'Fruit (Piperine)', klass: 'Bioenhancer Rasayana' },
  { id: 'guggulu', name: 'Guggulu', latin: 'Commiphora mukul', part: 'Purified oleo-gum-resin', klass: 'Medohara / Shothahara' },
];

const NOVELTY_MODES = [
  {
    id: 'nanocarrier',
    title: 'Nano-carrier / PEGylated Liposomal Delivery',
    desc: 'Encapsulation in 100-150 nm liposomes or lipid nanoparticles to cross biological barriers (BBB, dermal strata) overcoming Sec 3(p).',
    badge: 'High Patentability Tier',
    color: 'emerald'
  },
  {
    id: 'supercritical_co2',
    title: 'Supercritical CO2 Selective Fractionation',
    desc: 'Standardized extraction isolating high-purity bioactive marker profiles at specific non-classical ratios.',
    badge: 'Moderate-High Tier',
    color: 'indigo'
  },
  {
    id: 'synergistic_admixture',
    title: 'Standardized Synergistic Polyherbal Admixture',
    desc: 'Specific non-obvious ratio of two or more botanicals with experimental in-vitro/in-vivo proof satisfying Sec 3(e).',
    badge: 'Requires Experimental Proof',
    color: 'amber'
  },
  {
    id: 'purified_polymorph',
    title: 'Purified Bioactive Polymorph / Salt Derivative',
    desc: 'Novel crystalline form demonstrating enhanced therapeutic efficacy under Sec 3(d) (Novartis precedent).',
    badge: 'Rigorous Sec 3(d) Test',
    color: 'purple'
  },
];

const JURISDICTION_ROUTES = [
  {
    id: 'national',
    title: '🇮🇳 Indian National Route (IPO & National Biodiversity Authority)',
    desc: 'Patents Act 1970 (§ 3(p), § 3(e), § 3(d), § 10(4)) + Biological Diversity Act 2002 (Form 1 / SBB Clearances).',
    badge: 'Domestic Protection',
    recommendedFor: 'Indian Startups & MSMEs'
  },
  {
    id: 'international_pct',
    title: '🌐 International Route (PCT 30-Month + WIPO GRATK Treaty)',
    desc: 'Standardised Disclosure Statement (SDS Art 3), Nagoya Protocol Access & Benefit-Sharing, US FDA DSHEA / EU THMPD.',
    badge: 'Cross-Border Export',
    recommendedFor: 'Global Formulations & Exporters'
  }
];

export function IntakeWizardModal({ isOpen, onClose }) {
  const t = useT();
  const [step, setStep] = useState(1);
  const [selectedBotanicals, setSelectedBotanicals] = useState(['ashwagandha', 'brahmi']);
  const [isClassicalTk, setIsClassicalTk] = useState(true);
  const [noveltyMode, setNoveltyMode] = useState('nanocarrier');
  const [hasExperimentalProof, setHasExperimentalProof] = useState(true);
  const [targetRoute, setTargetRoute] = useState('international_pct');
  const [customIndication, setCustomIndication] = useState('Enhanced brain bioavailability and neurological synergy for cognitive health');

  const { setJurisdiction } = useChatStore();
  const { sendMessage } = useChatStream();
  const { sessionId } = useSession();

  if (!isOpen) return null;

  const toggleBotanical = (id) => {
    setSelectedBotanicals(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(b => b !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleLaunchAssessment = async () => {
    const herbsNames = selectedBotanicals.map(id => {
      const b = BOTANICAL_OPTIONS.find(item => item.id === id);
      return `${b.name} (${b.latin})`;
    }).join(' and ');

    const noveltyObj = NOVELTY_MODES.find(n => n.id === noveltyMode);
    const jurisdictionValue = targetRoute === 'international_pct' ? 'international' : 'national';
    
    // Set appropriate jurisdiction tab in chat store
    setJurisdiction(jurisdictionValue);

    let queryPrompt = '';
    if (jurisdictionValue === 'international') {
      queryPrompt = `Evaluate an international patent and export assessment for a ${noveltyObj.title} formulation comprising ${herbsNames} for ${customIndication}. Analyze compliance under WIPO GRATK Treaty 2024 Article 3 source disclosure, PCT 30-Month phase, US FDA DSHEA rules, and Indian Section 39 clearance prerequisites.`;
    } else {
      queryPrompt = `In our university laboratory, we developed a ${noveltyObj.title} comprising ${herbsNames} for ${customIndication}. Provide a comprehensive 5-part statutory patentability assessment under Patents Act 1970 (Section 3(p) TK bar, Section 3(e) synergistic efficacy, Section 10(4) source disclosure) and Biological Diversity Act 2002 (NBA Form 1 clearance).`;
    }

    onClose();
    await sendMessage(queryPrompt, jurisdictionValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-sage-200 flex flex-col overflow-hidden max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 bg-gradient-to-r from-ayur-800 to-ayur-950 text-white flex items-center justify-between border-b border-ayur-900 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10 shadow-inner shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading truncate">
                  Guided Formulation Intake Wizard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate hidden sm:block mt-0.5">
                Dynamic Clarification Dialogue Tree for Herbal Formulations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] sm:text-xs font-semibold shrink-0 gap-1 overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-1.5 shrink-0 ${step >= 1 ? 'text-ayur-800 font-bold' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step >= 1 ? 'bg-ayur-700 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span className="truncate">Botanicals</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <div className={`flex items-center gap-1.5 shrink-0 ${step >= 2 ? 'text-ayur-800 font-bold' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step >= 2 ? 'bg-ayur-700 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className="truncate">Novelty Mode</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <div className={`flex items-center gap-1.5 shrink-0 ${step >= 3 ? 'text-ayur-800 font-bold' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step >= 3 ? 'bg-ayur-700 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className="truncate">Filing Pathway</span>
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6 text-xs text-slate-700">
          
          {/* STEP 1: Botanicals & Classical Status */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Select Botanical Ingredients in Formulation</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Select one or more herbs. The engine automatically links them to codified TKDL classical formulations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {BOTANICAL_OPTIONS.map(herb => {
                  const isSelected = selectedBotanicals.includes(herb.id);
                  return (
                    <div
                      key={herb.id}
                      onClick={() => toggleBotanical(herb.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">{herb.name}</span>
                          <span className="text-[10px] text-slate-500 italic">({herb.latin})</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-600">Part: {herb.part}</p>
                        <span className="inline-block text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-sage-100 text-ayur-800">
                          {herb.klass}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Classical Traditional Knowledge (TK) Status</span>
                </span>
                <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                  Are these therapeutic properties documented in classical Ayurvedic texts (*Charaka Samhita*, *Sushruta Samhita*, *Bhavaprakasha*)?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1">
                  <label className="flex items-start sm:items-center gap-2 cursor-pointer font-semibold text-slate-800 text-[11px] sm:text-xs">
                    <input
                      type="radio"
                      name="classical_tk"
                      checked={isClassicalTk}
                      onChange={() => setIsClassicalTk(true)}
                      className="text-ayur-700 mt-0.5 sm:mt-0"
                    />
                    <span>Yes, documented in classical treaties (Triggers Sec 3(p))</span>
                  </label>
                  <label className="flex items-start sm:items-center gap-2 cursor-pointer font-semibold text-slate-800 text-[11px] sm:text-xs">
                    <input
                      type="radio"
                      name="classical_tk"
                      checked={!isClassicalTk}
                      onChange={() => setIsClassicalTk(false)}
                      className="text-ayur-700 mt-0.5 sm:mt-0"
                    />
                    <span>No, novel therapeutic target</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Novelty & Technological Delivery */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  What is the Technical or Extraction Novelty?
                </h3>
                <p className="text-slate-500">
                  Select the technological feature that elevates this formulation beyond a "mere admixture" under Section 3(e).
                </p>
              </div>

              <div className="space-y-3">
                {NOVELTY_MODES.map(mode => {
                  const isSelected = noveltyMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setNoveltyMode(mode.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-ayur-700 bg-ayur-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{mode.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{mode.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-ayur-700 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Primary Therapeutic Indication / Claim Focus
                </label>
                <input
                  type="text"
                  value={customIndication}
                  onChange={(e) => setCustomIndication(e.target.value)}
                  placeholder="e.g. Accelerated wound healing with 3.5x faster tissue epithelialization"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-ayur-600"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Jurisdiction & Filing Strategy */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  Select Target Jurisdiction & Filing Pathway
                </h3>
                <p className="text-slate-500">
                  The engine will tailor statutory citations, mandatory forms (IPO Form 25 / NBA Form 1 / WIPO SDS), and compliance rules.
                </p>
              </div>

              <div className="space-y-3">
                {JURISDICTION_ROUTES.map(route => {
                  const isSelected = targetRoute === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => setTargetRoute(route.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{route.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                            {route.badge}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{route.desc}</p>
                        <span className="inline-block text-[10px] font-medium text-slate-500">
                          Recommended for: <strong className="text-slate-700">{route.recommendedFor}</strong>
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Configured Assessment Query Preview
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  Evaluate {NOVELTY_MODES.find(n => n.id === noveltyMode)?.title} comprising {selectedBotanicals.map(id => BOTANICAL_OPTIONS.find(b => b.id === id)?.name).join(' + ')} targeting "{customIndication}".
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-semibold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ayur-700 hover:bg-ayur-800 text-white font-semibold transition-all cursor-pointer shadow-soft-card"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleLaunchAssessment}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Live Legal Assessment</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
