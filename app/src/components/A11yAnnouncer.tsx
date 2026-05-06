interface A11yAnnouncerProps {
  message: string
}

export function A11yAnnouncer({ message }: A11yAnnouncerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="xswu-visually-hidden"
    >
      {message}
    </div>
  )
}
