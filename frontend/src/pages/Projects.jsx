import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '', status: 'active' })

  const loadProjects = async () => {
    const { data } = await axios.get('/projects')
    setProjects(data.data || [])
  }

  useEffect(() => { loadProjects() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/projects', form)
      toast.success('Projet créé')
      setForm({ name: '', description: '', start_date: '', end_date: '', status: 'active' })
      loadProjects()
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Créer un projet</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input className="rounded border p-2" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded border p-2" placeholder="Statut" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <input className="rounded border p-2" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input className="rounded border p-2" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <textarea className="md:col-span-2 rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="button" className="md:col-span-2 rounded bg-indigo-600 px-4 py-2 text-white">Enregistrer</button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{project.name}</h3>
              <span className="rounded bg-indigo-100 px-2 py-1 text-sm text-indigo-700">{project.status}</span>
            </div>
            <p className="mb-4 text-sm text-slate-600">{project.description}</p>
            <Link to={`/projects/${project.id}`} className="text-indigo-600">Voir les détails</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
