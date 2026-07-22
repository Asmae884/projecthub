import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      toast.success('Inscription réussie')
      navigate('/')
    } catch (err) {
      toast.error('Impossible de créer le compte')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded border px-3 py-2" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded border px-3 py-2" type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white">S'inscrire</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">Déjà un compte ? <Link className="text-indigo-600" to="/login">Se connecter</Link></p>
      </div>
    </div>
  )
}
