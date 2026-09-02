import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-alabaster-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ayur-100 flex items-center justify-center text-ayur-700 mb-4 border border-ayur-200 shadow-sm">
        <Leaf className="w-7 h-7" />
      </div>
      <h1 className="text-4xl font-bold font-heading text-slate-900">404</h1>
      <p className="text-sm text-slate-600 mt-2 mb-6">The requested legal research view was not found.</p>
      <Button onClick={() => navigate('/app/chat')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Return to Research Workspace</span>
      </Button>
    </div>
  );
}
