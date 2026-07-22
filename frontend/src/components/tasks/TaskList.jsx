import React, { useState, useEffect } from 'react';
import { tasks } from '../../api';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import LoadingSpinner from '../common/LoadingSpinner';

const TaskList = ({ projectId }) => {
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await tasks.getAll(projectId, params);
      setTaskList(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const handleTaskUpdate = async (taskId, newStatus) => {
    try {
      await tasks.updateStatus(projectId, taskId, newStatus);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await tasks.delete(projectId, taskId);
        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  const getStatusLabel = (status) => {
    const labels = {
      all: 'Toutes',
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminées',
    };
    return labels[status] || status;
  };

  const getStatusCount = (status) => {
    if (!taskList.data) return 0;
    if (status === 'all') return taskList.data.length;
    return taskList.data.filter(task => task.status === status).length;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getStatusLabel(status)} ({getStatusCount(status)})
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Ajouter une tâche
        </button>
      </div>

      {taskList.data?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune tâche</p>
          <p className="text-gray-400 text-sm mt-2">Cliquez sur "Ajouter une tâche" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {taskList.data?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleTaskUpdate}
              onDelete={handleTaskDelete}
              projectId={projectId}
              onTaskUpdate={loadTasks}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          projectId={projectId}
          onClose={() => setShowForm(false)}
          onSuccess={loadTasks}
        />
      )}
    </div>
  );
};

export default TaskList;