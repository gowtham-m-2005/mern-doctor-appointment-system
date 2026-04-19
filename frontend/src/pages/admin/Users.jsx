import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Users, User, Stethoscope, Shield, Mail, Phone } from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      user: 'bg-blue-100 text-blue-700',
      doctor: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${styles[role] || 'bg-gray-100'}`}>
        {getRoleIcon(role)}
        {role}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
        <p className="text-on-surface-variant">View and manage all users</p>
      </div>

      <div className="card animate-scale-in stagger-1">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 items-center py-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-on-surface-variant border-b">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0 transition-all duration-200 hover:bg-surface-container-low hover:shadow-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface font-semibold">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-on-surface-variant">
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3">{getRoleBadge(user.role)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4 animate-fade-in-up stagger-2 hover-lift">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'user').length}</p>
            <p className="text-sm text-on-surface-variant">Patients</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 animate-fade-in-up stagger-3 hover-lift">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'doctor').length}</p>
            <p className="text-sm text-on-surface-variant">Doctors</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 animate-fade-in-up stagger-4 hover-lift">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
            <p className="text-sm text-on-surface-variant">Admins</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
