import React, { useState, useMemo } from 'react';
import { 
  Network, X, Sparkles, ShieldAlert, CheckCircle2, 
  FileText, ExternalLink, ZoomIn, ZoomOut, RotateCcw,
  BookOpen, Dna, Scale, Globe2, Layers
} from 'lucide-react';
import { useT } from '../../config/i18n';

const PRESET_ONTOLOGIES = {
  ashwagandha: {
    name: 'Ashwagandha & Brahmi Nano-Liposomal Formulation',
    nodes: [
      { id: 'f1', label: 'Formulation: Ashwagandha-Brahmi Nano-Liposome', type: 'root', x: 400, y: 220, category: 'Root Formulation' },
      { id: 'b1', label: 'Withania somnifera (Ashwagandha Root)', type: 'botanical', x: 200, y: 120, category: 'Botanical Resource' },
      { id: 'b2', label: 'Bacopa monnieri (Brahmi Whole Plant)', type: 'botanical', x: 200, y: 320, category: 'Botanical Resource' },
      { id: 't1', label: 'Charaka Samhita Sutrasthana (AY-ASH-012)', type: 'classical', x: 60, y: 120, category: 'Classical TK Canon' },
      { id: 't2', label: 'Sushruta Samhita Chikitsasthana', type: 'classical', x: 60, y: 320, category: 'Classical TK Canon' },
      { id: 'm1', label: 'Withanolide A & Withaferin A (HPLC Markers)', type: 'marker', x: 380, y: 70, category: 'Bio-Active Marker' },
      { id: 'm2', label: 'Bacoside A & B (Triterpenoid Saponins)', type: 'marker', x: 380, y: 370, category: 'Bio-Active Marker' },
      { id: 'l1', label: 'Patents Act § 3(p) TK Anticipation', type: 'statutory_bar', x: 580, y: 110, status: 'overcome', category: 'Statutory Bar' },
      { id: 'l2', label: 'Patents Act § 3(e) Synergistic Admixture', type: 'statutory_bar', x: 620, y: 220, status: 'met', category: 'Statutory Bar' },
      { id: 'l3', label: 'Patents Act § 3(d) Enhanced Therapeutic Efficacy', type: 'statutory_bar', x: 580, y: 330, status: 'met', category: 'Statutory Bar' },
      { id: 'r1', label: 'NBA Act 2002 § 6 Form 1 Approval', type: 'regulatory', x: 740, y: 140, status: 'pending', category: 'Regulatory Clearance' },
      { id: 'r2', label: 'WIPO GRATK Treaty 2024 Art 3 SDS', type: 'regulatory', x: 740, y: 300, status: 'required', category: 'International Regime' }
    ],
    edges: [
      { from: 't1', to: 'b1', label: 'Codifies Prior Art' },
      { from: 't2', to: 'b2', label: 'Documents Neurological Use' },
      { from: 'b1', to: 'm1', label: 'Active Phytochemical' },
      { from: 'b2', to: 'm2', label: 'Bioactive Constituent' },
      { from: 'b1', to: 'f1', label: 'Component (300 mg)' },
      { from: 'b2', to: 'f1', label: 'Component (150 mg)' },
      { from: 'f1', to: 'l1', label: 'Triggers Exclusion (Avoided via Nano-delivery)' },
      { from: 'f1', to: 'l2', label: 'Overcome with 4.2x Permeability Data' },
      { from: 'f1', to: 'l3', label: 'Demonstrated Enhanced Brain Plaque Clearance' },
      { from: 'b1', to: 'r1', label: 'Indian Bio-Resource Mandate' },
      { from: 'f1', to: 'r2', label: 'PCT Export Disclosure Obligation' }
    ],
    details: {
      l1: {
        title: 'Section 3(p) Traditional Knowledge Bar',
        status: 'Overcome via Technical Process',
        rule: 'An invention which, in effect, is traditional knowledge or an aggregation of known properties of traditionally known components is not patentable.',
        remedy: 'Claim is restricted to the specific PEGylated nano-liposomal carrier (120-150 nm size) and BBB receptor targeting, not the raw botanicals.'
      },
      l2: {
        title: 'Section 3(e) Synergistic Efficacy Requirement',
        status: 'Satisfied by In-Vitro Comparative Proof',
        rule: 'Mere admixture resulting only in the aggregation of the properties of the components is unpatentable.',
        remedy: 'Supported by comparative experimental data showing synergistic combination index CI < 0.7 and 4.2-fold higher brain bioavailability.'
      },
      r1: {
        title: 'National Biodiversity Authority (NBA Form I)',
        status: 'Mandatory Pre-Grant Approval',
        rule: 'Section 6 of Biological Diversity Act 2002 mandates approval before filing (if foreign entity) or before grant of patent (if Indian researcher).',
        remedy: 'File Form I with SBB/NBA along with Benefit Sharing Agreement (BSA).'
      },
      r2: {
        title: 'WIPO GRATK Treaty (2024) Article 3',
        status: 'Mandatory International Filing Disclosure',
        rule: 'Mandates standard disclosure of India as Country of Origin and Charaka Samhita/TKDL as Traditional Knowledge source in all PCT applications.',
        remedy: 'Include WIPO Standardised Disclosure Statement (SDS) in PCT Request form Box IX.'
      }
    }
  },
  neem_tulsi: {
    name: 'Neem & Tulsi Antimicrobial Topical Gel',
    nodes: [
      { id: 'f1', label: 'Formulation: Neem-Tulsi Topical Hydrogel', type: 'root', x: 400, y: 220, category: 'Root Formulation' },
      { id: 'b1', label: 'Azadirachta indica (Neem Leaf/Oil)', type: 'botanical', x: 200, y: 120, category: 'Botanical Resource' },
      { id: 'b2', label: 'Ocimum sanctum (Tulsi Essential Oil)', type: 'botanical', x: 200, y: 320, category: 'Botanical Resource' },
      { id: 't1', label: 'Bhavaprakasha Nighantu (Neem Antiseptic)', type: 'classical', x: 60, y: 120, category: 'Classical TK Canon' },
      { id: 't2', label: 'Charaka Samhita Kusthachikitsa', type: 'classical', x: 60, y: 320, category: 'Classical TK Canon' },
      { id: 'm1', label: 'Azadirachtin & Nimbin (Triterpenoids)', type: 'marker', x: 380, y: 70, category: 'Bio-Active Marker' },
      { id: 'm2', label: 'Eugenol & Caryophyllene (Volatile Oils)', type: 'marker', x: 380, y: 370, category: 'Bio-Active Marker' },
      { id: 'l1', label: 'Patents Act § 3(p) TK Anticipation', type: 'statutory_bar', x: 580, y: 110, status: 'overcome', category: 'Statutory Bar' },
      { id: 'l2', label: 'Patents Act § 3(e) Synergistic Admixture', type: 'statutory_bar', x: 620, y: 220, status: 'met', category: 'Statutory Bar' },
      { id: 'l3', label: 'Patents Act § 10(4) Biological Source Declaration', type: 'statutory_bar', x: 580, y: 330, status: 'met', category: 'Statutory Bar' },
      { id: 'r1', label: 'NBA Form 1 & SBB Intimation', type: 'regulatory', x: 740, y: 140, status: 'pending', category: 'Regulatory Clearance' },
      { id: 'r2', label: 'US FDA DSHEA / EU Cosmetic Directive', type: 'regulatory', x: 740, y: 300, status: 'required', category: 'International Regime' }
    ],
    edges: [
      { from: 't1', to: 'b1', label: 'Codified TK Prior Art' },
      { from: 't2', to: 'b2', label: 'Wound Healing Canonical Use' },
      { from: 'b1', to: 'm1', label: 'Phytochemical Marker' },
      { from: 'b2', to: 'm2', label: 'Terpenoid Profile' },
      { from: 'b1', to: 'f1', label: 'Active Oil (5% w/w)' },
      { from: 'b2', to: 'f1', label: 'Active Fraction (3% w/w)' },
      { from: 'f1', to: 'l1', label: 'Narrowed to Thermo-responsive Gel Matrix' },
      { from: 'f1', to: 'l2', label: 'Demonstrated 3.8-fold FICI Synergistic Ratio' },
      { from: 'f1', to: 'l3', label: 'Geo-source Declared (Karnataka & UP)' },
      { from: 'b1', to: 'r1', label: 'Mandatory Biological Diversity Compliance' },
      { from: 'f1', to: 'r2', label: 'Topical Export Classification' }
    ],
    details: {
      l1: {
        title: 'Section 3(p) Traditional Knowledge Bar',
        status: 'Overcome via Delivery Matrix',
        rule: 'Neem and Tulsi combinations are widely anticipated in TKDL formulations AY-NEE-045 and AY-TUL-102 for wound healing.',
        remedy: 'Draft claims around thermo-gelling Pluronic F127 polymer matrix providing sustained 24-hr topical release.'
      },
      l2: {
        title: 'Section 3(e) Synergistic Antimicrobial Ratio',
        status: 'Validated with Fractional Inhibitory Concentration Index (FICI = 0.42)',
        rule: 'Must establish that combination exhibits synergy beyond mathematical sum of individual oils against S. aureus and P. aeruginosa.',
        remedy: 'Include full disc-diffusion and checkerboard assay tables in Complete Specification.'
      },
      r1: {
        title: 'Biological Diversity Act Section 6 Compliance',
        status: 'Curable Procedural Prerequisite',
        rule: 'Madras High Court (Manu Chaudhary v. Controller, 2024) held NBA approval is curable prior to patent grant.',
        remedy: 'Submit Form 1 application simultaneously with Indian Patent Office Form 18 Request for Examination.'
      }
    }
  }
};

export function OntologyGraphModal({ isOpen, onClose }) {
  const t = useT();
  const [activeOntologyKey, setActiveOntologyKey] = useState('ashwagandha');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filterCategory, setFilterCategory] = useState('all');

  const activeData = PRESET_ONTOLOGIES[activeOntologyKey] || PRESET_ONTOLOGIES.ashwagandha;

  const filteredNodes = useMemo(() => {
    if (filterCategory === 'all') return activeData.nodes;
    return activeData.nodes.filter(n => n.type === filterCategory || n.type === 'root');
  }, [activeData, filterCategory]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return activeData.edges.filter(e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to));
  }, [activeData, filteredNodeIds]);

  if (!isOpen) return null;

  const getNodeColor = (node) => {
    if (selectedNode?.id === node.id) return { bg: '#047857', border: '#065f46', text: '#ffffff' };
    switch (node.type) {
      case 'root':
        return { bg: '#0f172a', border: '#334155', text: '#ffffff' };
      case 'botanical':
        return { bg: '#065f46', border: '#047857', text: '#ecfdf5' };
      case 'classical':
        return { bg: '#78350f', border: '#b45309', text: '#fef3c7' };
      case 'marker':
        return { bg: '#0e7490', border: '#0891b2', text: '#ecfeff' };
      case 'statutory_bar':
        return node.status === 'met' || node.status === 'overcome'
          ? { bg: '#166534', border: '#22c55e', text: '#f0fdf4' }
          : { bg: '#991b1b', border: '#ef4444', text: '#fef2f2' };
      case 'regulatory':
        return { bg: '#3730a3', border: '#6366f1', text: '#eef2ff' };
      default:
        return { bg: '#334155', border: '#64748b', text: '#ffffff' };
    }
  };

  const selectedDetails = selectedNode && activeData.details?.[selectedNode.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-6xl h-[94vh] sm:h-[90vh] max-h-[880px] rounded-2xl sm:rounded-3xl shadow-2xl border border-sage-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Network className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading truncate">
                  Relational Knowledge Graph Visualizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Domain Ontology
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Botanicals ➔ TKDL Sanskrit Treatises ➔ Active Markers ➔ Statutory Bars ➔ Regulatory Clearances
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

        {/* Toolbar & Filter Bar */}
        <div className="px-3 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0 overflow-x-auto no-scrollbar">
          {/* Preset Formulation Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-semibold text-slate-600 text-[11px] hidden md:inline">Preset:</span>
            <div className="flex bg-white p-0.5 sm:p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => {
                  setActiveOntologyKey('ashwagandha');
                  setSelectedNode(null);
                }}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeOntologyKey === 'ashwagandha'
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ashwagandha-Brahmi
              </button>
              <button
                onClick={() => {
                  setActiveOntologyKey('neem_tulsi');
                  setSelectedNode(null);
                }}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeOntologyKey === 'neem_tulsi'
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Neem-Tulsi
              </button>
            </div>
          </div>

          {/* Layer Filter Pills */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto">
            {[
              { id: 'all', label: 'All', icon: Layers },
              { id: 'botanical', label: 'Herbs', icon: Dna },
              { id: 'classical', label: 'TKDL', icon: BookOpen },
              { id: 'statutory_bar', label: 'Legal Bars', icon: Scale },
              { id: 'regulatory', label: 'Regulatory', icon: Globe2 },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all cursor-pointer text-[10px] sm:text-[11px] whitespace-nowrap ${
                  filterCategory === cat.id
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <cat.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-white p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-[9px] sm:text-[10px] font-mono px-1 text-slate-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.6, z + 0.15))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-l pl-1 border-slate-200"
              title="Reset view"
            >
              <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

        {/* Graph Canvas & Side Drawer */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-950">
          
          {/* Main SVG Graph Container */}
          <div className="flex-1 h-full overflow-hidden flex items-center justify-center p-4 relative select-none">
            
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

            <svg
              viewBox="0 0 850 450"
              className="w-full h-full max-h-full transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="20"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Edges */}
              {filteredEdges.map((edge, idx) => {
                const source = activeData.nodes.find(n => n.id === edge.from);
                const target = activeData.nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#10b981' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={source.type === 'regulatory' || target.type === 'regulatory' ? '4 3' : undefined}
                      markerEnd="url(#arrow)"
                      className="transition-colors duration-200"
                    />
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 4}
                      fill={isHighlighted ? '#a7f3d0' : '#64748b'}
                      fontSize="8"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const colors = getNodeColor(node);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for root node or selected node */}
                    {(node.type === 'root' || isSelected) && (
                      <circle
                        r="28"
                        fill="none"
                        stroke={isSelected ? '#10b981' : '#38bdf8'}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ animationDuration: '10s' }}
                      />
                    )}

                    {/* Node base circle */}
                    <circle
                      r="20"
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isSelected ? 'url(#glow)' : undefined}
                      className="transition-all duration-200 hover:scale-110"
                    />

                    {/* Node Icon text */}
                    <text
                      y="4"
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {node.type === 'root' ? '🌱' : node.type === 'botanical' ? '🌿' : node.type === 'classical' ? '📜' : node.type === 'marker' ? '⚗️' : node.type === 'statutory_bar' ? '⚖️' : '🏛️'}
                    </text>

                    {/* Node Label Box below */}
                    <g transform="translate(0, 30)">
                      <rect
                        x="-70"
                        y="0"
                        width="140"
                        height="18"
                        rx="5"
                        fill="#0f172a"
                        stroke={isSelected ? '#10b981' : '#1e293b'}
                        strokeWidth="1"
                        className="transition-colors"
                      />
                      <text
                        y="12"
                        textAnchor="middle"
                        fill={isSelected ? '#34d399' : '#cbd5e1'}
                        fontSize="7.5"
                        fontWeight="600"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none truncate"
                      >
                        {node.label.length > 28 ? `${node.label.slice(0, 26)}...` : node.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Side Inspection Panel (Opens on node click; responsive drawer on mobile) */}
          <div className={`
            ${selectedNode 
              ? 'fixed inset-y-0 right-0 z-30 w-full sm:w-96 shadow-2xl lg:shadow-none lg:static lg:w-80 xl:w-96' 
              : 'hidden lg:flex lg:w-80 xl:w-96 opacity-70'} 
            bg-slate-900 border-l border-slate-800 p-4 sm:p-5 overflow-y-auto flex flex-col justify-between shrink-0 transition-all
          `}>
            {selectedNode ? (
              <div className="space-y-3 sm:space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedNode.category}</span>
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close Inspector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {selectedNode.label}
                  </h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Node ID: {selectedNode.id}
                  </span>
                </div>

                {selectedDetails ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block">Assessment Verdict</span>
                      <p className="font-semibold text-white text-xs">{selectedDetails.status}</p>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Statutory Mandate / Rule</span>
                      <p className="leading-relaxed bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-slate-300 text-[11px]">
                        {selectedDetails.rule}
                      </p>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <span className="text-[9px] uppercase font-bold text-amber-400 block">Filing Strategy & Remedy</span>
                      <p className="leading-relaxed bg-amber-950/20 p-2 sm:p-2.5 rounded-xl border border-amber-800/40 text-amber-200 text-[11px]">
                        {selectedDetails.remedy}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
                    <p className="leading-relaxed text-[11px]">
                      This node is linked into the unified Ayur-IP Traditional Knowledge corpus.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-300">
                      <li>Indexed in 3,311 atomic vector chunks.</li>
                      <li>Verified against Patents Act 1970 and BDA 2002.</li>
                      <li>Cross-checked with TKDL prior-art classification.</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 p-4">
                <Network className="w-8 h-8 text-slate-700 animate-pulse" />
                <p className="text-[11px] text-slate-400 font-medium">
                  Click any node in the graph to inspect its statutory citations, traditional knowledge links, and filing remedies.
                </p>
              </div>
            )}

            {/* Footer Summary in Inspector */}
            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Ayur-IP Graph v2.4</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Synced
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
