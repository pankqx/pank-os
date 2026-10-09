export function Wipe() {
  return (
    <div className="wipe" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} style={{ animationDelay: `${(i % 5) * 45}ms` }} />
      ))}
    </div>
  )
}
