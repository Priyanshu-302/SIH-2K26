import React, { useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { DOCUMENT_CATEGORIES } from '../../config/api';
import { Button } from '../ui/Button';
import { validateUploadFile } from '../../utils/validators';

export function FileDragDrop() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('classical_text');
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState(null);
  const { uploadDocument, isUploading } = useDocumentUpload();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateUploadFile(file);
      if (!validation.isValid) {
        setValidationError(validation.error);
        setSelectedFile(null);
      } else {
        setValidationError(null);
        setSelectedFile(file);
      }
    }
  };

  const onSubmit = async () => {
    if (!selectedFile) return;
    await uploadDocument({ file: selectedFile, category, title });
    setSelectedFile(null);
    setTitle('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold font-heading text-slate-900">Ingest Knowledge Document</h3>
        <p className="text-xs text-slate-500">Upload PDF, DOCX, or TXT manuscripts for vector indexing.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Category (Required)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600 font-medium"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Document Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Caraka Samhita (Vimana Sthana)"
            className="w-full text-xs bg-alabaster-100 border border-sage-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-ayur-600"
          />
        </div>

        <div className="border-2 border-dashed border-sage-200 rounded-2xl p-6 text-center hover:border-ayur-500 transition-colors bg-alabaster-50">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
            <UploadCloud className="w-8 h-8 text-ayur-600" />
            <span className="text-xs font-semibold text-slate-800">
              {selectedFile ? selectedFile.name : 'Drag & drop files here or click to browse'}
            </span>
            <span className="text-[10px] text-slate-400">PDF, DOCX, TXT up to 50MB</span>
          </label>
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!selectedFile || isUploading}
          isLoading={isUploading}
          className="w-full bg-ayur-700 hover:bg-ayur-800 text-white shadow-soft-card"
        >
          {isUploading ? 'Uploading Document...' : 'Upload & Start Vector Ingestion'}
        </Button>
      </div>
    </div>
  );
}
