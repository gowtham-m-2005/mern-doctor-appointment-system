const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: 'bg-secondary-container text-on-secondary-container',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-surface-variant text-on-surface-variant',
    cancelled: 'bg-error-container text-on-error-container',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-surface-container-low'}`}>
      {status}
    </span>
  )
}

export default StatusBadge
