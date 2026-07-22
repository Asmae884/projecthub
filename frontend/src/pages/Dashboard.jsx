import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#4f46e5', '#0f766e', '#f59e0b']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const load = async () => {
      const [statsRes, tasksRes] = await Promise.all([
        axios.get('/dashboard'),
        axios.get('/tasks?limit=5')
      ])
      setStats(statsRes.data)
      setTasks(tasksRes.data.data || [])
    }
    load()
  }, [])

  const pieData = [
    { name: 'En cours', value: stats?.tasks_in_progress || 0 },
    { name: 'Terminées', value: stats?.tasks_completed || 0 },
    { name: 'En attente', value: stats?.tasks_pending || 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Projets', stats?.projects_count || 0],
          ['Tâches totales', stats?.tasks_count || 0],
          ['Terminées', stats?.tasks_completed || 0],
          ['En cours', stats?.tasks_in_progress || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">Répartition des tâches</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">Dernières tâches</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded border p-3">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-slate-500">{task.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
