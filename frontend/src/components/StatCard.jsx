const StatCard = ({ icon, value, label, description, badge, variant = 'default' }) => {
  const variants = {
    default: 'bg-primary-fixed text-primary',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow group" style={{ borderColor: 'color-mix(in srgb, var(--outline-variant) 10%, transparent)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl ${variants[variant]} flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-lg">{badge}</span>}
      </div>
      <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-extrabold font-headline mt-1 text-on-surface">{value}</h3>
      {description && <p className="text-[11px] text-on-surface-variant mt-2">{description}</p>}
    </div>
  )
}

export default StatCard
