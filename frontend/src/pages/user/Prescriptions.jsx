import { useEffect, useState } from 'react'
import api from '../../api/axios'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState(null)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const { data } = await api.get('/users/prescriptions')
      setPrescriptions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            My Prescriptions
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            View prescriptions from your completed appointments
          </p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-surface-container-lowest p-8 rounded-3xl text-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
            medication
          </span>
          <h2 className="text-xl font-bold mb-2 text-on-surface">No Prescriptions Yet</h2>
          <p className="text-on-surface-variant">
            Your prescriptions will appear here after your appointments are completed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((item) => (
            <div
              key={item.appointmentId}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                        Dr. {item.doctorName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface">Dr. {item.doctorName}</h3>
                        <p className="text-sm text-on-surface-variant">{item.doctorSpecialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        {formatDate(item.appointmentDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        {item.appointmentTime}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPrescription(selectedPrescription === item.appointmentId ? null : item.appointmentId)}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary-container transition-all"
                  >
                    {selectedPrescription === item.appointmentId ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {selectedPrescription === item.appointmentId && (
                <div className="p-5 bg-surface-container-low/50 animate-fade-in">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                      Doctor's Notes
                    </h4>
                    <p className="text-on-surface bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
                      {item.prescription.notes || 'No notes provided'}
                    </p>
                  </div>

                  {item.prescription.medicines && item.prescription.medicines.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                        Medicines
                      </h4>
                      <div className="grid gap-3">
                        {item.prescription.medicines.map((med, index) => (
                          <div
                            key={index}
                            className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined text-lg">pill</span>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-on-surface">{med.name}</h5>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-on-surface-variant">
                                  {med.dosage && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-base">science</span>
                                      {med.dosage}
                                    </span>
                                  )}
                                  {med.duration && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-base">schedule</span>
                                      {med.duration}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.prescription.addedAt && (
                    <p className="text-xs text-on-surface-variant/60 mt-4">
                      Added on {formatDate(item.prescription.addedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Prescriptions
