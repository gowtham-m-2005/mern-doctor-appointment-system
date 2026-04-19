const LoadingSkeleton = ({ count = 3, height = 'h-16', className = '' }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-surface-container-low ${height} rounded-xl animate-pulse ${className}`} />
      ))}
    </div>
  )
}

export default LoadingSkeleton
