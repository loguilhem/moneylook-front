export function Loader({ label, small = false }) {
  return (
    <span className={`loader-label ${small ? 'small' : ''}`}>
      <span className="loader-spinner" aria-hidden="true" />
      {label}
    </span>
  )
}

export function LoadingOverlay({ label }) {
  return (
    <div className="loading-overlay">
      <Loader label={label} />
    </div>
  )
}
