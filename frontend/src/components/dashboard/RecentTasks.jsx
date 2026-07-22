import React from 'react';
import { Link } from 'react-router-dom';

const RecentTasks = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Tâches récentes</h3>
        <p className="text-gray-500 text-center py-8">Aucune tâche récente</p>
      </div>
    );
  }

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Tâches récentes</h3>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
            <div className="flex-1">
              <Link to={`/projects/${task.project_id}`} className="font-medium text-gray-900 hover:text-blue-600">
                {task.title}
              </Link>
              <p className="text-sm text-gray-500">
                Projet: {task.project?.name || 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
              {task.assignee && (
                <span className="text-sm text-gray-500">
                  {task.assignee.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTasks;