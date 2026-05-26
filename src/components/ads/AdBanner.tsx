'use client'

import { useEffect, useRef } from 'react'

export function AdBanner() {
  const clientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-9710441137160587'
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID
  const pushed = useRef(false)

  useEffect(() => {
    if (!clientId || !slotId) return
    if (pushed.current) return
    pushed.current = true
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {}
  }, [clientId, slotId])

  if (!clientId || !slotId) return null

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
