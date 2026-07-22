// frontend/src/components/members/MemberList.jsx

import React, { useState, useEffect } from 'react';
import { members } from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';
import AddMemberForm from './AddMemberForm';

const MemberList = ({ projectId }) => {
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await members.getAll(projectId);
      setMemberList(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  
const handleRemoveMember = async (member) => {
  // ✅ MAINTENANT, pivot.id EXISTE !
  const memberId = member.pivot?.id;
  
  // Si pivot.id n'existe pas, fallback sur member.id
  const finalId = memberId || member.id;
  
  if (!finalId) {
    alert('Erreur: ID du membre invalide');
    return;
  }

  if (window.confirm(`Êtes-vous sûr de vouloir retirer ${member.name} du projet ?`)) {
    try {
      console.log('🗑️ Suppression avec ID:', finalId);
      await members.remove(projectId, finalId);
      await loadMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du retrait du membre');
    }
  }
};

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Membres du projet</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ajouter un membre
        </button>
      </div>

      {memberList.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucun membre</p>
      ) : (
        <div className="space-y-3">
          {memberList.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border rounded-lg p-4 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-bold">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  member.pivot?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.pivot?.role === 'admin' ? 'Administrateur' : 'Membre'}
                </span>
                {/* ✅ BOUTON CORRIGÉ - Passe l'objet member entier */}
                {member.pivot?.role !== 'admin' && (
                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Retirer
                  </button>
                )}
                {/* Si c'est un admin, afficher un texte au lieu du bouton */}
                {member.pivot?.role === 'admin' && (
                  <span className="text-xs text-gray-400">Administrateur</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddMemberForm
          projectId={projectId}
          onClose={() => setShowAddForm(false)}
          onSuccess={loadMembers}
        />
      )}
    </div>
  );
};

export default MemberList;
