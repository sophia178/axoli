'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LoginPing() {
  const router = useRouter()

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/login/ping', { method: 'POST' })
      if (res.ok) router.refresh()
    })()
  }, [router])

  return null
}
