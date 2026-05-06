import { useCallback, useState } from 'react'

const ZERO_WIDTH_SPACE = '\u200b'

export interface AnnouncerApi {
  message: string
  announce: (text: string) => void
}

export function useAnnouncer(): AnnouncerApi {
  const [message, setMessage] = useState<string>('')

  const announce = useCallback((text: string) => {
    if (text === '') {
      setMessage('')
      return
    }
    setMessage((prev) => {
      const stripped = prev.replace(new RegExp(`${ZERO_WIDTH_SPACE}+$`), '')
      return stripped === text ? `${text}${ZERO_WIDTH_SPACE}` : text
    })
  }, [])

  return { message, announce }
}
