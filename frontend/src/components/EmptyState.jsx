const EmptyState = ({ icon, message, actionText, actionLink, size = 'default' }) => {
  const sizes = {
    default: 'text-5xl',
    small: 'text-4xl',
  }

  return (
    <div className="text-center py-8">
      <span className={`material-symbols-outlined mb-3 ${sizes[size]}`} style={{ color: 'color-mix(in srgb, var(--on-surface-variant) 30%, transparent)' }}>
        {icon}
      </span>
      <p className="text-on-surface-variant">{message}</p>
      {actionText && actionLink && (
        <div className="mt-4">
          <a href={actionLink} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-md shadow-primary/10 inline-block">
            {actionText}
          </a>
        </div>
      )}
    </div>
  )
}

export default EmptyState
