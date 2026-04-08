import { useState, useRef, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Tag } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { getCategoryIcon } from './categoryIcons'
import { useAuth } from '@/context/AuthContext'

interface Props {
  value: string
  onChange: (id: string) => void
  maxVisibleItems?: number
}

export function CategoryDropdown({ value, onChange, maxVisibleItems = 4 }: Props) {
  const { user, addCategory } = useAuth()
  const [mode, setMode] = useState<'idle' | 'form'>('idle')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const cat = await addCategory(name)
      onChange(cat.id)
      setMode('idle')
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  function openForm() {
    setMode('form')
    // Focus the input after paint
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const footer = mode === 'idle' ? (
    <button
      type="button"
      className="bud-dd-footer-btn"
      onPointerDown={e => e.stopPropagation()}
      onClick={openForm}
    >
      <Plus size={12} />
      New category
    </button>
  ) : (
    <form
      className="bud-dd-new-cat-form"
      onSubmit={handleCreate}
      onPointerDown={e => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        className="bud-dd-new-cat-input"
        placeholder="Category name"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => {
          e.stopPropagation()
          if (e.key === 'Escape') { setMode('idle'); setNewName('') }
        }}
        autoComplete="off"
      />
      <button
        type="submit"
        className="bud-dd-new-cat-submit"
        disabled={creating || !newName.trim()}
      >
        {creating ? '…' : 'Create'}
      </button>
    </form>
  )

  return (
    <Dropdown
      value={value || undefined}
      onChange={id => { onChange(id); setMode('idle') }}
      placeholder="No category"
      searchable
      maxVisibleItems={maxVisibleItems}
      footer={footer}
      options={[
        { value: '', label: 'No category', icon: <Tag size={13} /> },
        ...(user?.categories ?? []).map(cat => {
          const Icon = getCategoryIcon(cat.name)
          return { value: cat.id, label: cat.name, icon: <Icon size={13} /> }
        }),
      ]}
    />
  )
}
