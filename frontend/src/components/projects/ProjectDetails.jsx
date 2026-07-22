import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projects } from '../../api';
import TaskList from '../tasks/TaskList';
import MemberList from '../members/MemberList';
import LoadingSpinner from '../common/LoadingSpinner';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  const loadProject = async () => {
    setLoading(true);
    try {
      const response = await projects.get(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await projects.delete(id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Actif',
      completed: 'Terminé',
      paused: 'En pause',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span> {project.creator?.name || 'N/A'}</span>
              <span> {new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
              {project.end_date && (
                <span> Fin: {new Date(project.end_date).toLocaleDateString('fr-FR')}</span>
              )}
              <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/projects/${id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
               Tâches ({project.tasks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
               Membres ({project.members?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tasks' && (
            <TaskList projectId={id} project={project} />
          )}
          {activeTab === 'members' && (
            <MemberList projectId={id} project={project} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;