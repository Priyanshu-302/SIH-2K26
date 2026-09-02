import { useState, useCallback } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { uploadDocumentAPI, pollDocumentStatusAPI, fetchDocumentsAPI } from '../services/apiService';

export function useDocumentUpload() {
  const { sessionId, setSessionId } = useChatStore();
  const { setDocuments, updateJobProgress, removeJob, setIsUploadModalOpen } = useDocumentStore();
  const { addToast } = useUIStore();
  const [isUploading, setIsUploading] = useState(false);

  const startPolling = useCallback(
    (documentId, filename) => {
      updateJobProgress(documentId, { status: 'pending', progress: 10, filename });

      const interval = setInterval(async () => {
        try {
          const statusData = await pollDocumentStatusAPI(documentId);
          updateJobProgress(documentId, {
            status: statusData.status,
            progress: statusData.progress || 50,
            error: statusData.error,
          });

          if (statusData.status === 'completed') {
            clearInterval(interval);
            removeJob(documentId);
            addToast({ type: 'success', message: `Ingestion completed for ${filename}` });
            // Refresh documents table list
            const docs = await fetchDocumentsAPI();
            setDocuments(docs);
          } else if (statusData.status === 'failed') {
            clearInterval(interval);
            removeJob(documentId);
            addToast({ type: 'error', message: `Ingestion failed: ${statusData.error || 'Unknown error'}` });
          }
        } catch (err) {
          console.error('[Polling Error]:', err);
        }
      }, 2000);
    },
    [updateJobProgress, removeJob, addToast, setDocuments]
  );

  const uploadDocument = useCallback(
    async ({ file, category, title }) => {
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        try {
          const sessionRes = await createSessionAPI();
          currentSessionId = sessionRes.sessionId;
          setSessionId(currentSessionId);
        } catch (err) {
          addToast({ type: 'error', message: `Could not start session for upload: ${err.message}` });
          return;
        }
      }

      setIsUploading(true);
      try {
        const response = await uploadDocumentAPI(currentSessionId, file, category, title);
        addToast({ type: 'info', message: `Document upload accepted (${file.name}). Ingestion in progress...` });
        setIsUploadModalOpen(false);
        startPolling(response.documentId, file.name);
      } catch (err) {
        addToast({ type: 'error', message: `Upload failed: ${err.message}` });
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId, setSessionId, addToast, setIsUploadModalOpen, startPolling]
  );

  return {
    uploadDocument,
    isUploading,
  };
}
