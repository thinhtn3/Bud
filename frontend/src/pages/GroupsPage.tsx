import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Group } from '@/types'
import { budStyles } from '@/components/widgets/budStyles'
import { groupStyles } from '@/components/group/groupStyles'
import { Navbar } from '@/components/Navbar'
import GroupList from '@/components/group/GroupList'
import CreateGroupModal from '@/components/group/CreateGroupModal'
import JoinGroupModal from '@/components/group/JoinGroupModal'

export default function GroupsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  useEffect(() => {
    api.get<Group[]>('/api/groups')
      .then(setGroups)
      .finally(() => setLoading(false))
  }, [])

  function handleGroupCreated(group: Group) {
    setGroups(prev => [{ ...group, member_count: 1 }, ...prev])
    setCreateOpen(false)
    navigate('/group/' + group.id)
  }

  function handleGroupJoined(group: Group) {
    setGroups(prev => {
      if (prev.find(g => g.id === group.id)) return prev
      return [group, ...prev]
    })
    setJoinOpen(false)
    navigate('/group/' + group.id)
  }

  if (!user) return null

  return (
    <>
      <style>{budStyles}</style>
      <style>{groupStyles}</style>
      <Navbar />
      <div className="bud-root group-root" style={{ paddingLeft: 220 }}>
        {/* Background blobs */}
        <div className="bud-bg-blob bud-bg-blob-1" />
        <div className="bud-bg-blob bud-bg-blob-2" />
        <div className="bud-bg-blob bud-bg-blob-3" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <div className="group-page-header">
            <div className="group-page-title">Split</div>
            {groups.length > 0 && (
              <div className="group-page-actions">
                <button className="group-btn-secondary" onClick={() => setJoinOpen(true)}>Join group</button>
                <button className="group-btn-primary" onClick={() => setCreateOpen(true)}>+ Create group</button>
              </div>
            )}
          </div>
          <GroupList
            groups={groups}
            loading={loading}
            currentUserId={user.id}
            onSelect={(id) => navigate('/group/' + id)}
            onCreateGroup={() => setCreateOpen(true)}
            onJoinGroup={() => setJoinOpen(true)}
          />
        </div>

        <CreateGroupModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleGroupCreated}
        />
        <JoinGroupModal
          open={joinOpen}
          onClose={() => setJoinOpen(false)}
          onJoined={handleGroupJoined}
        />
      </div>
    </>
  )
}
