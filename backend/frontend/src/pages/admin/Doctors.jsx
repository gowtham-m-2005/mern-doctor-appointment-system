import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { CheckCircle, XCircle, Stethoscope, Clock, ExternalLink, X } from 'lucide-react'

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([api.get('/admin/doctors/all'), api.get('/admin/doctors/pending')])
      setDoctors(allRes.data)
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
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
        <p className="text-gray-500">Approve and manage doctors</p>
      </div>

      {pendingDoctors.length > 0 && (
        <div className="card border-yellow-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approvals ({pendingDoctors.length})
          </h2>
          <div className="space-y-3">
            {pendingDoctors.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-semibold">
                    {doctor.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{doctor.user?.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization} • {doctor.qualification}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => approveDoctor(doctor._id, 'approved')}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => approveDoctor(doctor._id, 'rejected')}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">All Doctors</h2>
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Specialization</th>
                  <th className="pb-3">Experience</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {doctor.user?.name?.charAt(0)}
                        </div>
                        <span>{doctor.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{doctor.specialization}</td>
                    <td className="py-3">{doctor.experience} years</td>
                    <td className="py-3">${doctor.fee}</td>
                    <td className="py-3">{getStatusBadge(doctor.isApproved)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Doctor Details</h2>
              <button onClick={() => setSelectedDoctor(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                  {selectedDoctor.user?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedDoctor.user?.name}</h3>
                  <p className="text-gray-500">{selectedDoctor.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Specialization</p>
                  <p className="font-medium">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <p className="text-gray-500">Qualification</p>
                  <p className="font-medium">{selectedDoctor.qualification}</p>
                </div>
                <div>
                  <p className="text-gray-500">Experience</p>
                  <p className="font-medium">{selectedDoctor.experience} years</p>
                </div>
                <div>
                  <p className="text-gray-500">Consultation Fee</p>
                  <p className="font-medium">${selectedDoctor.fee}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Bio</p>
                <p className="mt-1">{selectedDoctor.bio || 'No bio provided'}</p>
              </div>

              {selectedDoctor.certificate && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Certificate</p>
                  <a
                    href={selectedDoctor.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Certificate
                  </a>
                </div>
              )}

              {selectedDoctor.isApproved === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { approveDoctor(selectedDoctor._id, 'approved'); setSelectedDoctor(null); }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => { approveDoctor(selectedDoctor._id, 'rejected'); setSelectedDoctor(null); }}
                    className="flex-1 btn-secondary text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDoctors
