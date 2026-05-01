import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { GroupDetail } from '@/types'
import { budStyles } from '@/components/widgets/budStyles'
import { groupStyles } from '@/components/group/groupStyles'
import { Navbar } from '@/components/Navbar'
import GroupDetailComponent from '@/components/group/GroupDetail'

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) { navigate('/group', { replace: true }); return }
    api.get<GroupDetail>(`/api/groups/${groupId}`)
      .then(() => setAuthorized(true))
      .catch(() => navigate('/group', { replace: true }))
      .finally(() => setLoading(false))
  }, [groupId])

  if (loading || !user || !groupId) return null

  if (!authorized) return null

  return (
    <>
      <style>{budStyles}</style>
      <style>{groupStyles}</style>
      <Navbar />
      <div className="bud-root group-root" style={{ paddingLeft: 'var(--desktop-nav-offset, 220px)' }}>
        <div className="bud-bg-blob bud-bg-blob-1" />
        <div className="bud-bg-blob bud-bg-blob-2" />
        <div className="bud-bg-blob bud-bg-blob-3" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <GroupDetailComponent
            groupId={groupId}
            currentUserId={user.id}
            onBack={() => navigate('/group')}
          />
        </div>
      </div>
    </>
  )
}
