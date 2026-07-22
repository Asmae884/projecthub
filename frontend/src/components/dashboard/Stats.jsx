import React from 'react';
import { 
  FolderIcon, 
  ClipboardListIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/outline';

const Stats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      label: 'Projets',
      value: stats.total_projects,
      icon: FolderIcon,
      color: 'bg-blue-500',
    },
    {
      label: 'Tâches totales',
      value: stats.total_tasks,
      icon: ClipboardListIcon,
      color: 'bg-purple-500',
    },
    {
      label: 'Tâches terminées',
      value: stats.completed_tasks,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      label: 'Tâches en cours',
      value: stats.in_progress_tasks,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.label} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`${item.color} p-3 rounded-full`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;