import React, { useState, useEffect } from 'react';
import { dashboard } from '../../api';
import Stats from './Stats';
import RecentTasks from './RecentTasks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboard.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pieData = stats ? [
    { name: 'En attente', value: stats.pending_tasks },
    { name: 'En cours', value: stats.in_progress_tasks },
    { name: 'Terminées', value: stats.completed_tasks },
  ] : [];

  const COLORS = ['#FFB74D', '#64B5F6', '#81C784'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <Stats stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Statut des tâches</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Tâches par projet</h3>
          {stats?.tasks_by_project && stats.tasks_by_project.length > 0 ? (
            <BarChart width={400} height={300} data={stats.tasks_by_project}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend formatter={() => 'Nombre de tâches'} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          ) : (
            <p className="text-gray-500">Aucune tâche</p>
          )}
        </div>
      </div>

      <RecentTasks tasks={stats?.recent_tasks || []} />
    </div>
  );
};

export default Dashboard;