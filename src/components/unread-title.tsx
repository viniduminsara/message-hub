"use client"

import { useEffect, useState } from "react"

export function UnreadTitle() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/messages?read=false&limit=1")
        if (res.ok) {
          const data = await res.json()
          setUnread(data.total)
        }
      } catch {}
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const base = "MessageHub"
    if (unread > 0) {
      document.title = `(${unread}) ${base}`
    } else {
      document.title = base
    }
  }, [unread])

  return null
}
