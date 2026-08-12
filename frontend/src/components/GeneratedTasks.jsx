
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function GeneratedTasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGeneratedTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/generated-tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Erreur chargement suggestions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchGeneratedTasks();
    }
  }, [projectId]);

  const handleValidate = async (taskId) => {
    try {
      await api.patch(`/generated-tasks/${taskId}/validate`);
      toast.success('Tâche validée !');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'validated' } : t));
    } catch (error) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleReject = async (taskId) => {
    try {
      await api.delete(`/generated-tasks/${taskId}/reject`);
      toast.success('Tâche rejetée');
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'rejected' } : t));
    } catch (error) {
      toast.error('Erreur lors du rejet');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  if (loading) return <div className="text-sm text-slate-500">Chargement des suggestions...</div>;

  return (
    <div className="generated-tasks mt-4">
      <h3 className="text-lg font-semibold"> Suggestions IA</h3>
      {pendingTasks.length === 0 ? (
        <p className="text-sm text-slate-500 mt-2">Aucune suggestion en attente.</p>
      ) : (
        <ul className="space-y-3 mt-2">
          {pendingTasks.map(task => (
            <li key={task.id} className="border rounded p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-slate-600">{task.description}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span>Priorité : {task.priority}</span>
                    {task.estimated_hours && <span> {task.estimated_hours}h</span>}
                    {task.due_date && <span> {task.due_date}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleValidate(task.id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                     Valider
                  </button>
                  <button
                    onClick={() => handleReject(task.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                     Rejeter
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GeneratedTasks;