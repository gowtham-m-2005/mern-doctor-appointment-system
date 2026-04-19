import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../../api/axios'
import { CheckCircle, XCircle, Stethoscope, Clock, ExternalLink, X, Search, RefreshCw } from 'lucide-react'

const BACKEND = 'http://localhost:5000'

const AdminDoctors = () => {
  const [allDoctors, setAllDoctors] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.get('/admin/doctors/all'),
        api.get('/admin/doctors/pending'),
      ])
      setAllDoctors(allRes.data)
      setPendingDoctors(pendingRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const approveDoctor = async (id, status) => {
    try {
      await api.put(`/admin/doctors/${id}/approve`, { status })
      fetchDoctors()
      if (selectedDoctor?._id === id) setSelectedDoctor(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      pending:  'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    )
  }

  const filtered = allDoctors
    .filter((d) => filter === 'all' ? true : d.isApproved === filter)
    .filter((d) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        d.user?.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.qualification?.toLowerCase().includes(q)
      )
    })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Doctor Management</h1>
          <p className="text-on-surface-variant">Approve and manage all registered doctors</p>
        </div>
        <button onClick={fetchDoctors} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Pending approvals banner */}
      {pendingDoctors.length > 0 && (
        <div className="card border-yellow-300 bg-yellow-50 animate-fade-in-up stagger-1">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Approvals ({pendingDoctors.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingDoctors.map((doctor, index) => (
              <div key={doctor._id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200 animate-fade-in-up transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-semibold">
                    {doctor.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{doctor.user?.name}</p>
                    <p className="text-sm text-on-surface-variant">{doctor.specialization} • {doctor.qualification}</p>
                    <p className="text-xs text-on-surface-variant">{doctor.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-high border border-outline-variant rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    onClick={() => approveDoctor(doctor._id, 'approved')}
                    className="px-3 py-1.5 text-sm text-green-700 hover:bg-green-100 border border-green-300 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => approveDoctor(doctor._id, 'rejected')}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-300 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All doctors table */}
      <div className="card animate-scale-in stagger-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">
            All Doctors
            <span className="ml-2 text-sm font-normal text-on-surface-variant">({filtered.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                className="input pl-9 w-48 py-1.5 text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Status filter */}
            {['all', 'approved', 'pending', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === s
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 items-center py-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <Stethoscope className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
            <p className="text-on-surface-variant">No doctors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Specialization</th>
                  <th className="px-6 py-3">Qualification</th>
                  <th className="px-6 py-3">Experience</th>
                  <th className="px-6 py-3">Fee</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-surface-container-low transition-all duration-200 hover:shadow-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                          {doctor.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doctor.user?.name}</p>
                          <p className="text-xs text-on-surface-variant">{doctor.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{doctor.specialization}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{doctor.qualification}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{doctor.experience} yrs</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">₹{doctor.fee}</td>
                    <td className="px-6 py-4">{getStatusBadge(doctor.isApproved)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDoctor(doctor)}
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
                          title="View details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {doctor.isApproved === 'pending' && (
                          <>
                            <button
                              onClick={() => approveDoctor(doctor._id, 'approved')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => approveDoctor(doctor._id, 'rejected')}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {doctor.isApproved === 'rejected' && (
                          <button
                            onClick={() => approveDoctor(doctor._id, 'approved')}
                            className="px-2 py-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            Re-approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor detail modal - Portal */}
      {selectedDoctor && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="p-6 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}} flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Doctor Details</h2>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-2 hover:bg-surface-container-low rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedDoctor.user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-on-surface">Dr. {selectedDoctor.user?.name}</h3>
                  <p className="text-on-surface-variant text-sm">{selectedDoctor.user?.email}</p>
                  <p className="text-sm" style={{color: 'color-mix(in srgb, var(--on-surface-variant) 60%, transparent)'}}>{selectedDoctor.user?.phone || 'No phone'}</p>
                </div>
              </div>

              {getStatusBadge(selectedDoctor.isApproved)}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-on-surface-variant text-xs mb-0.5">Specialization</p>
                  <p className="font-medium text-on-surface">{selectedDoctor.specialization}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-on-surface-variant text-xs mb-0.5">Qualification</p>
                  <p className="font-medium text-on-surface">{selectedDoctor.qualification}</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-on-surface-variant text-xs mb-0.5">Experience</p>
                  <p className="font-medium text-on-surface">{selectedDoctor.experience} years</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-xl">
                  <p className="text-on-surface-variant text-xs mb-0.5">Consultation Fee</p>
                  <p className="font-medium text-on-surface">₹{selectedDoctor.fee}</p>
                </div>
              </div>

              {selectedDoctor.address && (
                <div className="bg-surface-container-low p-3 rounded-xl text-sm">
                  <p className="text-on-surface-variant text-xs mb-0.5">Address</p>
                  <p className="font-medium text-on-surface">{selectedDoctor.address}</p>
                </div>
              )}

              {selectedDoctor.bio && (
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-on-surface bg-surface-container-low p-3 rounded-xl">{selectedDoctor.bio}</p>
                </div>
              )}

              {selectedDoctor.certificate && (
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Certificate</p>
                  <a
                    href={`${BACKEND}${selectedDoctor.certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Certificate
                  </a>
                </div>
              )}

              {selectedDoctor.isApproved === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => approveDoctor(selectedDoctor._id, 'approved')}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => approveDoctor(selectedDoctor._id, 'rejected')}
                    className="flex-1 btn-secondary text-error hover:bg-error-container flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
              {selectedDoctor.isApproved === 'rejected' && (
                <button
                  onClick={() => approveDoctor(selectedDoctor._id, 'approved')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Re-approve Doctor
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminDoctors
