import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon, EyeIcon } from '@heroicons/react/outline';
import { projects } from '../../api';
import LoadingSpinner from '../common/LoadingSpinner';

const ProjectList = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projects.getAll({ page: currentPage });
      setProjectList(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentPage]);

  if (loading) return <LoadingSpinner />;

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
    <div className="bg-white rounded-lg shadow-md p-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mes Projets</h2>
        <Link
          to="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouveau Projet
        </Link>
      </div>

      {projectList.data?.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun projet</p>
          <Link to="/projects/new" className="text-blue-600 hover:text-blue-700">
            Créer votre premier projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.data?.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-all hover:border-blue-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'Aucune description'}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                <span className="text-gray-500">
                  {new Date(project.start_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-gray-500">

                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  Voir détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {projectList.links && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {projectList.links.map((link, index) => (
            <button
              key={index}
              onClick={() => link.url && setCurrentPage(new URL(link.url).searchParams.get('page'))}
              className={`px-3 py-1 rounded-md transition-colors ${
                link.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!link.url}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;