import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, ArrowRight, ShieldCheck, Database, CheckCircle2, 
  Sparkles, BookOpen, Scale, UserCheck, ChevronRight, Menu, X, UploadCloud
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/common/Footer';
import { BotanicalScales3D } from '../components/common/BotanicalScales3D';
import { FloatingBackground } from '../components/common/FloatingBackground';
import { useAuthStore } from '../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive TKDL explorer state
  const [selectedManuscript, setSelectedManuscript] = useState('charaka');

  // Interactive Section 3(p) Claim Simulator state
  const [selectedClaim, setSelectedClaim] = useState('neem_tulsi');

  const MANUSCRIPTS = {
    charaka: {
      title: 'चरक संहिता (Charaka Samhita)',
      section: 'Sutrasthana, Chapter 145',
      verse: 'तदेव युक्तं भैषज्यं यदारोग्याय कल्पते । स चापि भिषजां श्रेष्ठो रोगेभ्यो यः प्रमुच्यते ॥',
      translation: 'That formulation alone is authentic medicine which restores health and balance. Polyherbal synergies of Guduchi, Haridra, and Yestimadhu are classified under Rasayana.',
      tkdlId: 'TKDL/CS/SS/145',
      botanicals: ['Tinospora cordifolia (Guduchi)', 'Glycyrrhiza glabra (Yestimadhu)'],
    },
    sushruta: {
      title: 'सुश्रुत संहिता (Sushruta Samhita)',
      section: 'Chikitsasthana, Chapter 28',
      verse: 'निम्बस्य पत्राणि कषाययोगे प्रलेपने चैव हितानि सन्ति । रोगाञ्जयेत् सर्वविधान् व्रणांश्च ॥',
      translation: 'Neem leaf preparations and topical decoctions are prescribed for dermatological wound healing and tissue repair.',
      tkdlId: 'TKDL/SS/CS/288',
      botanicals: ['Azadirachta indica (Neem)', 'Curcuma longa (Haridra)'],
    },
    ashtanga: {
      title: 'अष्टाङ्ग हृदय (Ashtanga Hridaya)',
      section: 'Uttarasthana, Chapter 39',
      verse: 'हरीतकी धात्री विभीतकश्च त्रिफला स्मृता । दीपनं पाचनं चैव सर्वनेत्रामयापहम् ॥',
      translation: 'The classic Triphala combination (Haritaki, Bibhitaki, Amalaki) is described as an ocular tonic and metabolic regulator.',
      tkdlId: 'TKDL/AH/US/390',
      botanicals: ['Terminalia chebula', 'Terminalia bellirica', 'Phyllanthus emblica'],
    },
  };

  const SIMULATED_CLAIMS = {
    neem_tulsi: {
      title: 'Neem & Tulsi Antibacterial Topical Gel',
      formulation: 'Azadirachta indica (5%) + Ocimum sanctum (3%) extract in standard hydrogel base.',
      verdict: 'STATUTORY EXCLUSION § 3(p)',
      badgeVariant: 'bg-rose-100 text-rose-800 border-rose-300',
      analysis: 'Anticipated in Sushruta Samhita Chikitsasthana. The combination of Neem and Tulsi for topical antimicrobial use is traditional knowledge and non-patentable under Section 3(p).',
      remedy: 'Applicant must prove novel extraction fractions with non-obvious synergistic efficacy data to overcome § 3(e).',
      citations: ['[TKDL Act § 3(p)]', '[Sushruta Samhita Ch. 28]'],
    },
    guduchi_synergy: {
      title: 'Guduchi & Piperine Bioavailability Enhancer',
      formulation: 'Tinospora cordifolia alkaloid fraction (50mg) with Piper longum piperine (5mg).',
      verdict: 'SYNERGISTIC CLEARANCE PATH',
      badgeVariant: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      analysis: 'While individual plants are in TKDL, the specific non-obvious extraction ratio demonstrates 3.4x enhancement in bioavailability beyond additive aggregation, overcoming Section 3(e).',
      remedy: 'Patentable with restricted claim scope on specific synergistic extraction ratios.',
      citations: ['[Patents Act § 3(e)]', '[Prior Art EP1234567A]'],
    },
    ashwagandha_nano: {
      title: 'Withania Somnifera Targeted Liposomal Complex',
      formulation: 'Withanolide-A encapsulated in lipid nanoparticle carrier for blood-brain barrier penetration.',
      verdict: 'NOVEL DRUG DELIVERY CLEARED',
      badgeVariant: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      analysis: 'The botanical compound is traditional, but the nanoparticle formulation represents novel pharmaceutical technology not disclosed in ancient literature.',
      remedy: 'Cleared under Section 3(p); examination proceeds on novelty and inventive step (Section 2(1)(j)).',
      citations: ['[Patents Act § 2(1)(j)]', '[Charaka Samhita Sutra 12]'],
    },
  };

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-alabaster-100 text-slate-800 flex flex-col selection:bg-ayur-100 selection:text-ayur-900 scroll-smooth relative overflow-hidden">
      {/* 🌌 Floating Background Aura & Translucent Micro-Particles */}
      <FloatingBackground />

      {/* Navigation Bar with Fade Down Entrance Animation */}
      <header className="h-16 sm:h-20 px-4 sm:px-8 max-w-7xl mx-auto w-full flex items-center justify-between sticky top-0 bg-alabaster-100/90 backdrop-blur-md z-50 border-b border-sage-100/80 animate-hero-fade-down">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-ayur-100 flex items-center justify-center border border-ayur-300 shadow-sm transition-transform hover:scale-105">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-ayur-700" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-tight">Ayur-IP</h1>
            <p className="text-[9px] sm:text-[11px] font-medium text-ayur-700 tracking-wide uppercase">Ancient Wisdom, Modern Patents</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button onClick={() => handleNavClick('features')} className="hover:text-ayur-800 transition-colors cursor-pointer">Features</button>
          <button onClick={() => handleNavClick('tkdl')} className="hover:text-ayur-800 transition-colors cursor-pointer">TKDL Integration</button>
          <button onClick={() => handleNavClick('statutes')} className="hover:text-ayur-800 transition-colors cursor-pointer">Section 3(p) Engine</button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {!isAuthenticated ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
              className="hover:border-ayur-400 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-ayur-700" />
              <span>Sign In</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/app/profile')}
              className="hover:border-ayur-400 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-ayur-700" />
              <span>Examiner Profile</span>
            </Button>
          )}

          <Button 
            size="sm"
            className="bg-ayur-700 hover:bg-ayur-800 text-white shadow-soft-card"
            onClick={() => navigate(isAuthenticated ? '/app/chat' : '/login?redirect=/app/chat')}
          >
            <span>{isAuthenticated ? 'Launch Workspace' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Button 
            size="sm"
            className="bg-ayur-700 text-white text-xs px-3 py-1.5"
            onClick={() => navigate('/app/chat')}
          >
            <span>Launch</span>
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-sage-50 border border-sage-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 bg-white/98 backdrop-blur-lg border-b border-sage-200 shadow-elevated p-5 space-y-4 sm:hidden animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-2.5 text-sm font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('features')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sage-50 text-left"
            >
              <span>Platform Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => handleNavClick('tkdl')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sage-50 text-left"
            >
              <span>TKDL Classical Integration</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => handleNavClick('statutes')}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sage-50 text-left"
            >
              <span>Section 3(p) & 3(e) Engine</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-3 border-t border-sage-100 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setMobileMenuOpen(false); navigate('/app/admin'); }}
              className="text-xs justify-center"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1" />
              <span>Admin Ingest</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setMobileMenuOpen(false); navigate('/app/profile'); }}
              className="text-xs justify-center"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1 text-ayur-700" />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section with Staggered Entrance Animations */}
      <section className="pt-6 sm:pt-14 pb-12 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Animated Text Sequence */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Step 1: Badge Reveal */}
            <div className="animate-hero-fade-up animation-delay-100">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ayur-50/90 backdrop-blur-xs border border-ayur-200 text-ayur-800 text-[11px] sm:text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-ayur-600 shrink-0 animate-pulse" />
                <span>AI-Powered Traditional Knowledge Classification</span>
              </div>
            </div>

            {/* Step 2: Headline Reveal */}
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 leading-[1.15] animate-hero-fade-up animation-delay-200">
              Decipher Classical Ayurveda. <br />
              <span className="text-ayur-700 bg-clip-text">Protect Herbal Innovations.</span>
            </h2>

            {/* Step 3: Paragraph Reveal */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-hero-fade-up animation-delay-300">
              Cross-reference modern patent claims against classical Ayurvedic texts (Charaka, Sushruta, Vagbhata) and the TKDL repository to enforce Section 3(p) compliance with real-time verifiable citations.
            </p>

            {/* Step 4: Action Buttons Reveal */}
            <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 pt-2 animate-hero-fade-up animation-delay-400">
              <Button 
                size="lg"
                className="w-full xs:w-auto bg-ayur-700 hover:bg-ayur-800 text-white text-xs sm:text-sm font-semibold px-6 shadow-glow-mint justify-center transition-all hover:scale-105"
                onClick={() => navigate('/app/chat')}
              >
                <span>Start Legal Analysis</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button 
                variant="outline"
                size="lg"
                className="w-full xs:w-auto bg-white/95 hover:bg-sage-50 text-slate-700 border-sage-200 text-xs sm:text-sm justify-center transition-all hover:border-ayur-300"
                onClick={() => navigate('/app/admin')}
              >
                <Database className="w-4 h-4 mr-2 text-ayur-600" />
                <span>Explore Ingested Texts</span>
              </Button>
            </div>

            {/* Step 5: Statutory badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-3 text-[11px] sm:text-xs text-slate-500 font-medium animate-hero-fade-up animation-delay-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ayur-600 shrink-0" /> Indian Patents Act 1970 § 3(p)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ayur-600 shrink-0" /> TKDL Verified Ontologies
              </span>
            </div>
          </div>

          {/* Right Column: 3D Botanical Scales Component with Scale-in Entrance */}
          <div className="lg:col-span-6 flex justify-center w-full animate-hero-scale animation-delay-300">
            <BotanicalScales3D />
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards with Smooth Entrance */}
      <section id="features" className="py-12 sm:py-20 bg-white/90 backdrop-blur-md border-y border-sage-100 px-4 sm:px-6 relative z-10 animate-hero-fade-up animation-delay-500">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <span className="text-[10px] sm:text-xs font-bold font-heading text-ayur-700 uppercase tracking-wider bg-ayur-50 px-3 py-1 rounded-full border border-ayur-200">
              Core Architecture
            </span>
            <h3 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
              Complete Legal-Botanical Intelligence Stack
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Engineered for Patent Examiners, Ayurveda Researchers, and IP Legal Counsel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="light-card rounded-2xl p-5 sm:p-7 space-y-3 sm:space-y-4 hover:-translate-y-1.5 transition-all border border-sage-100 shadow-soft-card">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-ayur-100 flex items-center justify-center text-ayur-700 shadow-sm border border-ayur-200">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900">Classical Sanskrit RAG</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vectorized retrieval across Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya with English statutory translations and botanical cross-matching.
              </p>
            </div>

            <div className="light-card rounded-2xl p-5 sm:p-7 space-y-3 sm:space-y-4 hover:-translate-y-1.5 transition-all border border-sage-100 shadow-soft-card">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm border border-amber-200">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900">Section 3(p) Compliance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated legal validation preventing bio-piracy and detecting unpatentable aggregations of traditional knowledge under Indian Patent Law.
              </p>
            </div>

            <div className="light-card rounded-2xl p-5 sm:p-7 space-y-3 sm:space-y-4 hover:-translate-y-1.5 transition-all border border-sage-100 shadow-soft-card">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-200">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900">Verifiable Citations</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every legal assertion is backed by a verifiable source document link, confidence similarity score, and verbatim gazette clause excerpts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📜 Interactive TKDL Integration Section (#tkdl) */}
      <section id="tkdl" className="py-12 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8 sm:space-y-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[10px] sm:text-xs font-bold font-heading text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            Ontological Knowledge Retrieval
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
            Direct TKDL & Classical Manuscript Integration
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our semantic engine aligns modern Latin botanical nomenclature (e.g. <em>Azadirachta indica</em>) with classical Sanskrit formulations from ancient treatises.
          </p>
        </div>

        {/* Interactive Manuscript Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Selector List */}
          <div className="lg:col-span-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Classical Scripture Database:
            </h4>

            <div
              onClick={() => setSelectedManuscript('charaka')}
              className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedManuscript === 'charaka'
                  ? 'bg-white border-ayur-500 shadow-elevated scale-[1.01]'
                  : 'bg-alabaster-50/80 border-sage-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center font-bold text-xs">
                    CS
                  </div>
                  <div>
                    <h5 className="text-sm font-bold font-heading text-slate-900">Charaka Samhita</h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Internal Medicine & Rasayana</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedManuscript === 'charaka' ? 'text-ayur-700' : 'text-slate-400'}`} />
              </div>
            </div>

            <div
              onClick={() => setSelectedManuscript('sushruta')}
              className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedManuscript === 'sushruta'
                  ? 'bg-white border-ayur-500 shadow-elevated scale-[1.01]'
                  : 'bg-alabaster-50/80 border-sage-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    SS
                  </div>
                  <div>
                    <h5 className="text-sm font-bold font-heading text-slate-900">Sushruta Samhita</h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Surgical & Topical Formulations</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedManuscript === 'sushruta' ? 'text-ayur-700' : 'text-slate-400'}`} />
              </div>
            </div>

            <div
              onClick={() => setSelectedManuscript('ashtanga')}
              className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedManuscript === 'ashtanga'
                  ? 'bg-white border-ayur-500 shadow-elevated scale-[1.01]'
                  : 'bg-alabaster-50/80 border-sage-200 hover:bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    AH
                  </div>
                  <div>
                    <h5 className="text-sm font-bold font-heading text-slate-900">Ashtanga Hridaya</h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Eightfold Ayurvedic Synthesis</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedManuscript === 'ashtanga' ? 'text-ayur-700' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

          {/* Right Live Manuscript Preview */}
          <div className="lg:col-span-7">
            <div className="light-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 border border-sage-200 shadow-elevated">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-sage-100">
                <div>
                  <h4 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                    {MANUSCRIPTS[selectedManuscript].title}
                  </h4>
                  <span className="text-[11px] sm:text-xs font-mono text-ayur-700 font-semibold">
                    {MANUSCRIPTS[selectedManuscript].section}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-ayur-100 text-ayur-800 px-2.5 sm:px-3 py-1 rounded-full border border-ayur-300">
                  {MANUSCRIPTS[selectedManuscript].tkdlId}
                </span>
              </div>

              {/* Classical Sanskrit Card */}
              <div className="parchment-box rounded-xl sm:rounded-2xl p-4 sm:p-5 border-l-4 border-l-goldParchment-500 shadow-sm space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900 block">
                  Original Sanskrit Verse:
                </span>
                <p className="text-xs sm:text-sm md:text-base font-serif italic text-slate-900 leading-relaxed">
                  "{MANUSCRIPTS[selectedManuscript].verse}"
                </p>
              </div>

              {/* Translation & Entities */}
              <div className="space-y-2.5 sm:space-y-3 text-xs leading-relaxed text-slate-700">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Statutory English Translation:
                </span>
                <p className="bg-alabaster-50 p-3 sm:p-3.5 rounded-xl border border-sage-100 text-[11px] sm:text-xs">
                  {MANUSCRIPTS[selectedManuscript].translation}
                </p>

                <div className="pt-1 sm:pt-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Extracted Botanical Ontologies:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {MANUSCRIPTS[selectedManuscript].botanicals.map((bot, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-medium border border-emerald-200"
                      >
                        <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{bot}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ Section 3(p) Statutory Engine Section (#statutes) */}
      <section id="statutes" className="py-12 sm:py-24 bg-white/90 backdrop-blur-md border-y border-sage-100 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <span className="text-[10px] sm:text-xs font-bold font-heading text-amber-800 uppercase tracking-wider bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
              Statutory Decision Logic
            </span>
            <h3 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">
              Section 3(p) & 3(e) Examination Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Simulate patent claim assessments against Indian Patent Law statutory exclusions and traditional knowledge barriers in real time.
            </p>
          </div>

          {/* 4-Stage Decision Process */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            <div className="light-card rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 border border-sage-100">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-xs sm:text-sm font-bold font-heading text-slate-900">TKDL Vector Scan</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Matches claim components against 250,000+ indexed formulations across ancient Samhitas.
              </p>
            </div>

            <div className="light-card rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 border border-sage-100">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-xs sm:text-sm font-bold font-heading text-slate-900">§ 3(p) Bar Test</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Determines if the active composition is direct traditional knowledge or mere aggregation.
              </p>
            </div>

            <div className="light-card rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 border border-sage-100">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-xs sm:text-sm font-bold font-heading text-slate-900">§ 3(e) Synergy Check</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Requires comparative experimental proof that therapeutic efficacy exceeds additive sum.
              </p>
            </div>

            <div className="light-card rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 border border-sage-100">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="text-xs sm:text-sm font-bold font-heading text-slate-900">Citation Dossier</h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                Issues statutory clearance or objections with exact Gazette and Samhita references.
              </p>
            </div>
          </div>

          {/* Interactive Claim Simulator */}
          <div className="light-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 border border-sage-200 shadow-elevated">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-sage-100">
              <div>
                <h4 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                  Interactive Patent Claim Simulation
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Select sample claims to test real-time statutory evaluation:
                </p>
              </div>

              {/* Sample Claim Selectors */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setSelectedClaim('neem_tulsi')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                    selectedClaim === 'neem_tulsi'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-sage-50 text-slate-700 hover:bg-sage-100'
                  }`}
                >
                  Neem + Tulsi
                </button>
                <button
                  onClick={() => setSelectedClaim('guduchi_synergy')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                    selectedClaim === 'guduchi_synergy'
                      ? 'bg-ayur-700 text-white shadow-sm'
                      : 'bg-sage-50 text-slate-700 hover:bg-sage-100'
                  }`}
                >
                  Guduchi + Piperine
                </button>
                <button
                  onClick={() => setSelectedClaim('ashwagandha_nano')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                    selectedClaim === 'ashwagandha_nano'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-sage-50 text-slate-700 hover:bg-sage-100'
                  }`}
                >
                  Ashwagandha Nano
                </button>
              </div>
            </div>

            {/* Simulation Result Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              <div className="lg:col-span-5 space-y-2.5 bg-alabaster-50 p-4 sm:p-5 rounded-2xl border border-sage-100">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Claim Formulation:
                </span>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  {SIMULATED_CLAIMS[selectedClaim].title}
                </h5>
                <p className="text-[11px] sm:text-xs font-mono text-slate-600 bg-white p-2.5 sm:p-3 rounded-xl border border-sage-200 leading-relaxed">
                  "{SIMULATED_CLAIMS[selectedClaim].formulation}"
                </p>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {SIMULATED_CLAIMS[selectedClaim].citations.map((cit, idx) => (
                    <span key={idx} className="text-[10px] sm:text-[11px] font-mono font-semibold bg-ayur-100 text-ayur-800 px-2 py-0.5 rounded-md border border-ayur-300">
                      {cit}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Statutory Determination:
                  </span>
                  <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${SIMULATED_CLAIMS[selectedClaim].badgeVariant}`}>
                    {SIMULATED_CLAIMS[selectedClaim].verdict}
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-sage-200 text-xs leading-relaxed space-y-2 text-slate-700">
                  <p><strong>Legal Assessment:</strong> {SIMULATED_CLAIMS[selectedClaim].analysis}</p>
                  <p className="text-emerald-800 font-semibold pt-1 border-t border-sage-100">
                    <strong>Remedy / Pathway:</strong> {SIMULATED_CLAIMS[selectedClaim].remedy}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-ayur-700 hover:bg-ayur-800 text-white text-xs justify-center"
                    onClick={() => navigate('/app/chat')}
                  >
                    <span>Run Full Claim in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
