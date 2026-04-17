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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">View and manage all users</p>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-gray-500">
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3">{getRoleBadge(user.role)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
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
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'user').length}</p>
            <p className="text-sm text-gray-500">Patients</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'doctor').length}</p>
            <p className="text-sm text-gray-500">Doctors</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
            <p className="text-sm text-gray-500">Admins</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
