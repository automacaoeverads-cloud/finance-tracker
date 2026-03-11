'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase, Category } from '@/lib/supabase'
import { Trash2, Plus, Pencil } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/utils'

const ICONS = ['🍽️', '🚗', '🏠', '🎮', '🛍️', '💊', '✈️', '📚', '💼', '🎵', '🐾', '💡', '📱', '🏋️', '☕']

export default function Categorias() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', color: '#b2f0e8', icon: '🍽️' })

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.name) return
    if (editingId) {
      await supabase.from('categories').update(form).eq('id', editingId)
    } else {
      await supabase.from('categories').insert(form)
    }
    setForm({ name: '', color: '#b2f0e8', icon: '🍽️' })
    setShowForm(false)
    setEditingId(null)
    loadCategories()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta categoria?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(cat: Category) {
    setForm({ name: cat.name, color: cat.color, icon: cat.icon })
    setEditingId(cat.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-900">Categorias</h2>
          <p className="text-sm text-gray-400 mt-1">{categories.length} categorias</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', color: '#b2f0e8', icon: '🍽️' }) }}
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
          <h3 className="font-semibold text-teal-800 mb-4">{editingId ? 'Editar' : 'Nova'} Categoria</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Nome</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Alimentação"
                className="w-full px-4 py-2.5 rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-teal-50/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CATEGORY_COLORS).map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(p => ({ ...p, color }))}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? '#0d9488' : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Ícone</label>
              <div className="flex flex-wrap gap-1">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(p => ({ ...p, icon }))}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${form.icon === icon ? 'bg-teal-100' : 'hover:bg-teal-50'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 rounded-xl border border-teal-200 text-sm text-teal-700 hover:bg-teal-50">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600">Salvar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-300 border-t-teal-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-teal-50 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cat.color + '80' }}>
                  {cat.icon}
                </div>
                <span className="font-medium text-teal-900">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <p>Nenhuma categoria ainda. Crie a primeira!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
