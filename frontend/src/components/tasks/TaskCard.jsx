import React, { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import { members, tasks } from '../../api';

const TaskCard = ({ task, onStatusChange, onDelete, projectId, onTaskUpdate }) => {
  const [memberList, setMemberList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Charger les membres du projet
  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
  }, [projectId]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await members.getList(projectId);
      setMemberList(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

const handleAssign = async (taskId, userId) => {
  try {
    console.log('Assigning task:', { taskId, userId, type: typeof userId }); // DEBUG
    
    // S'assurer que userId est un entier ou null
    const data = { assigned_to: userId ? parseInt(userId) : null };
    console.log('Sending data:', data); // DEBUG
    
    const response = await tasks.update(projectId, taskId, data);
    console.log('Response:', response.data); // DEBUG
    
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  } catch (error) {
    console.error('Error assigning task:', error);
    console.error('Error response:', error.response?.data); // DEBUG
    
    // Afficher le message d'erreur détaillé
    const errorMessage = error.response?.data?.errors 
      ? Object.values(error.response.data.errors).flat().join(', ')
      : error.response?.data?.message || 'Erreur lors de l\'assignation';
    alert('Erreur: ' + errorMessage);
  }
};

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminée',
    };
    return labels[status] || status;
  };

  const statuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
  ];

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
            {task.due_date && (
              <span className="text-sm text-gray-500">
                 {new Date(task.due_date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          {task.assignee && (
            <p className="text-sm text-gray-500 mt-2">
              Assigné à: {task.assignee.name}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
            </Menu.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border max-h-96 overflow-y-auto">
                <div className="py-1">
                  {/* Changer le statut */}
                  <Menu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <div className="font-medium mb-1 text-gray-900"> Changer le statut</div>
                        {statuses.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => onStatusChange(task.id, status.value)}
                            className={`block w-full text-left px-2 py-1 text-sm rounded ${
                              task.status === status.value
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </Menu.Item>

                  {/* Assigner à un membre */}
                  <Menu.Item>
                    {({ active }) => (
                      <div className="px-4 py-2 text-sm text-gray-700 border-t">
                        <div className="font-medium mb-1 text-gray-900"> Assigner à</div>
                        <button
                          onClick={() => handleAssign(task.id, null)}
                          className={`block w-full text-left px-2 py-1 text-sm rounded ${
                            !task.assigned_to
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          Non assigné
                        </button>
                        {loadingMembers ? (
                          <div className="text-gray-400 text-sm px-2 py-1">Chargement...</div>
                        ) : memberList.length === 0 ? (
                          <div className="text-gray-400 text-sm px-2 py-1">Aucun membre</div>
                        ) : (
                          memberList.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleAssign(task.id, member.id)}
                              className={`block w-full text-left px-2 py-1 text-sm rounded ${
                                task.assigned_to === member.id
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {member.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </Menu.Item>

                  {/* Supprimer */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onDelete(task.id)}
                        className={`block w-full text-left px-4 py-2 text-sm text-red-600 border-t ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                         Supprimer
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
