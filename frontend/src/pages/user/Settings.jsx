import { useAuthStore } from '../../store/authStore'
import UserThemePicker from '../../components/UserThemePicker'

const UserSettings = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-headline text-on-surface tracking-tight">
          Settings
        </h1>
        <p className="text-on-surface-variant mt-1 font-medium">
          Customize your experience
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,82,174,0.04)]">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold font-headline text-on-surface">Appearance</h2>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">
            Personalize your theme
          </p>
        </div>
        <UserThemePicker />
      </div>

      {/* Account Info */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,82,174,0.04)]">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold font-headline text-on-surface">Account Information</h2>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">
            Your account details
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}}">
            <span className="text-on-surface-variant">Name</span>
            <span className="font-medium text-on-surface">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}}">
            <span className="text-on-surface-variant">Email</span>
            <span className="font-medium text-on-surface">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b style={{borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)'}}">
            <span className="text-on-surface-variant">Role</span>
            <span className="font-medium text-on-surface capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
