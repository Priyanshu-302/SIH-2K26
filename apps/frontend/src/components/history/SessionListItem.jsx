import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';

export function SessionListItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditTitle(session.title || '');
  }, [session.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartRename = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsConfirmingDelete(false);
    setIsEditing(true);
    setEditTitle(session.title || '');
  };

  const handleCancelRename = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsEditing(false);
    setEditTitle(session.title || '');
  };

  const handleSaveRename = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const trimmed = editTitle.trim();
    if (!trimmed) return;

    if (trimmed === session.title) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      if (onRename) {
        await onRename(session.id, trimmed);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename(e);
    }
  };

  const handleStartDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(false);
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsConfirmingDelete(false);
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (onDelete) {
        await onDelete(session.id);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setIsSubmitting(false);
      setIsConfirmingDelete(false);
    }
  };

  if (isConfirmingDelete) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className="p-2.5 rounded-xl bg-red-50/90 border border-red-200 flex items-center justify-between gap-2 transition-all animate-fadeIn"
      >
        <span className="text-[11px] font-semibold text-red-700 flex items-center gap-1.5 truncate">
          <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>Delete session?</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
            className="px-2.5 py-1 text-[10px] font-bold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Confirm deletion"
          >
            {isSubmitting ? '...' : 'Yes'}
          </button>
          <button
            type="button"
            onClick={handleCancelDelete}
            disabled={isSubmitting}
            className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Cancel"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        className={`p-2 rounded-xl flex items-center gap-1.5 border transition-all ${
          isActive
            ? 'bg-ayur-50 border-ayur-300'
            : 'bg-white border-ayur-300 shadow-sm'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          maxLength={100}
          className="flex-1 min-w-0 px-2 py-1 text-xs font-medium text-slate-800 bg-white border border-ayur-200 rounded-lg focus:outline-none focus:border-ayur-600 focus:ring-1 focus:ring-ayur-500 transition-all"
          placeholder="Session title..."
        />
        <button
          type="button"
          onClick={handleSaveRename}
          disabled={isSubmitting || !editTitle.trim()}
          className="p-1.5 rounded-md text-ayur-700 hover:bg-ayur-100 active:bg-ayur-200 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          title="Save (Enter)"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCancelRename}
          disabled={isSubmitting}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Cancel (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
        isActive
          ? 'bg-ayur-50 border border-ayur-200 text-ayur-900 shadow-sm'
          : 'hover:bg-sage-50 text-slate-700'
      }`}
    >
      <div className="flex items-start gap-2.5 overflow-hidden min-w-0 flex-1">
        <MessageSquare
          className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
            isActive ? 'text-ayur-700' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        />
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="text-xs font-semibold truncate leading-tight">
            {session.title}
          </p>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {session.date}
          </span>
        </div>
      </div>

      <div className="flex items-center shrink-0 z-10">
        {/* Action buttons: visible on hover or focus on desktop, and accessible on touch */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleStartRename}
            className="p-1.5 rounded-md text-slate-400 hover:text-ayur-700 hover:bg-white shadow-xs transition-all cursor-pointer"
            title="Rename assessment"
            aria-label="Rename assessment"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleStartDelete}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-white shadow-xs transition-all cursor-pointer"
            title="Delete assessment"
            aria-label="Delete assessment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chevron icon */}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 hidden sm:block sm:group-hover:hidden transition-transform ml-0.5" />
      </div>
    </div>
  );
}


