import React from 'react';
import { Leaf, ShieldCheck, Scale, ExternalLink, Globe, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-sage-100 mt-auto shrink-0 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-sage-100">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ayur-100 flex items-center justify-center border border-ayur-200">
                <Leaf className="w-4 h-4 text-ayur-700" />
              </div>
              <span className="text-base font-bold font-heading text-slate-900 leading-tight">Ayur-IP</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              AI-Powered Intellectual Property Classification and Prior Art Legal Research System for Classical Ayurveda.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-fit">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>TKDL & IPO Compliant</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => navigate('/app/chat')} className="hover:text-ayur-700 transition-colors">
                  Legal Research Workspace
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/admin')} className="hover:text-ayur-700 transition-colors">
                  Ingestion & Vector Console
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/profile')} className="hover:text-ayur-700 transition-colors">
                  Examiner Profile & Credentials
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/')} className="hover:text-ayur-700 transition-colors">
                  Landing & System Overview
                </button>
              </li>
            </ul>
          </div>

          {/* Statutory References */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider">
              Legal Framework
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-ayur-600 shrink-0" />
                <span>Patents Act 1970 § 3(p) & § 3(e)</span>
              </li>
              <li className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-ayur-600 shrink-0" />
                <span>Traditional Knowledge Digital Library</span>
              </li>
              <li className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-ayur-600 shrink-0" />
                <span>Biological Diversity Act, 2002</span>
              </li>
              <li className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-ayur-600 shrink-0" />
                <span>WIPO Traditional Knowledge Registry</span>
              </li>
            </ul>
          </div>

          {/* Institutional Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider">
              Official Portals
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://www.ipindia.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ayur-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Indian Patent Office (IPO)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ayush.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ayur-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Ministry of AYUSH</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tkdl.res.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ayur-700 inline-flex items-center gap-1 transition-colors"
                >
                  <span>TKDL Access Gateway</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Ayur-IP Classification & Legal Intelligence Platform.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Assessment</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">System Status: All Services Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
