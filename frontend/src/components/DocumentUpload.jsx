
import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function DocumentUpload({ projectId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('file', file);

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document envoyé ! Analyse en cours...');
      setFile(null);
      // Réinitialiser l'input file
      document.getElementById('fileInput').value = '';
      if (onUploadSuccess) onUploadSuccess(response.data.document_id);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de l\'upload';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <h3 className="text-lg font-semibold mb-2"> Importer un document (PDF/DOCX)</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {uploading ? 'Traitement...' : 'Analyser le document'}
        </button>
      </form>
      <p className="text-xs text-slate-400 mt-2">Formats acceptés : PDF, DOCX (max 20 Mo)</p>
    </div>
  );
}

export default DocumentUpload;