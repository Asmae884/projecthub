import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ProjectDetails() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '' })
  const [memberForm, setMemberForm] = useState({ email: '', role: 'member' })

  const load = async () => {
    const [projectRes, tasksRes, membersRes] = await Promise.all([
      axios.get(`/projects/${id}`),
      axios.get(`/projects/${id}/tasks`),
      axios.get(`/projects/${id}/members`),
    ])
    setProject(projectRes.data)
    setTasks(tasksRes.data.data || [])
    setMembers(membersRes.data || [])
  }

  useEffect(() => { load() }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/projects/${id}/tasks`, form)
      toast.success('Tâche créée')
      setForm({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '' })
      load()
    } catch {
      toast.error('Erreur lors de la création')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/projects/${id}/members`, memberForm)
      toast.success('Membre ajouté')
      setMemberForm({ email: '', role: 'member' })
      load()
    } catch {
      toast.error('Impossible d’ajouter le membre')
    }
  }

  if (!project) return <div>Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">{project.name}</h2>
        <p className="mt-2 text-slate-600">{project.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Ajouter une tâche</h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input className="rounded border p-2" placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className="rounded border p-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
            <input className="rounded border p-2" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <select className="rounded border p-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
            <textarea className="rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="button" className="rounded bg-indigo-600 px-4 py-2 text-white">Créer la tâche</button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Ajouter un membre</h3>
          <form onSubmit={handleAddMember} className="grid gap-4">
            <input className="rounded border p-2" placeholder="Email du membre" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} required />
            <select className="rounded border p-2" value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
              <option value="member">Membre</option>
              <option value="admin">Admin</option>
            </select>
            <button type="button" className="rounded bg-slate-800 px-4 py-2 text-white">Ajouter</button>
          </form>
          <div className="mt-6">
            <h4 className="mb-2 font-semibold">Membres</h4>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded border p-3">
                  <span>{member.name} ({member.email})</span>
                  <span className="text-sm text-slate-500">{member.pivot?.role || 'member'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{task.title}</h4>
              <span className="rounded bg-slate-100 px-2 py-1 text-sm">{task.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{task.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
