import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useBrandingStore } from './store/brandingStore'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorRegister from './pages/DoctorRegister'
import UserDashboard from './pages/user/Dashboard'
import UserDoctors from './pages/user/Doctors'
import UserAppointments from './pages/user/Appointments'
import UserPrescriptions from './pages/user/Prescriptions'
import UserSettings from './pages/user/Settings'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorProfile from './pages/doctor/Profile'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorSlots from './pages/doctor/Slots'
import AdminDashboard from './pages/admin/Dashboard'
import AdminDoctors from './pages/admin/Doctors'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import AdminAppointments from './pages/admin/Appointments'
import { applyTheme } from './constants/themes'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />
  
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" />
    if (user?.role === 'doctor') return <Navigate to="/doctor" />
    return <Navigate to="/dashboard" />
  }
  return children
}

function App() {
  const { theme, fetchThemeSettings } = useAuthStore()
  const { fetchBranding } = useBrandingStore()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    fetchThemeSettings()
    fetchBranding()
  }, [])
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/register-doctor" element={<PublicRoute><DoctorRegister /></PublicRoute>} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowedRoles={['user']}><UserDoctors /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute allowedRoles={['user']}><UserAppointments /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['user']}><UserPrescriptions /></ProtectedRoute>} />
        <Route path="/user/settings" element={<ProtectedRoute allowedRoles={['user']}><UserSettings /></ProtectedRoute>} />
        
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/slots" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorSlots /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
