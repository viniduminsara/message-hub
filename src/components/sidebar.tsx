"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreateFormModal } from "@/components/create-form-modal"

interface FormItem {
  id: string
  name: string
  slug: string
  _count: { messages: number }
}

export function Sidebar({
  className,
  onMobileClose,
}: {
  className?: string
  onMobileClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [forms, setForms] = useState<FormItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchForms()
    fetchUnreadCount()
  }, [])

  async function fetchForms() {
    const res = await fetch("/api/forms")
    if (res.ok) {
      const data = await res.json()
      setForms(data)
    }
  }

  async function fetchUnreadCount() {
    const res = await fetch("/api/messages?read=false&limit=1")
    if (res.ok) {
      const data = await res.json()
      setUnreadCount(data.total)
    }
  }

  async function handleDeleteForm(formId: string) {
    const confirmed = window.confirm(
      "Delete this form and ALL its messages? This cannot be undone."
    )
    if (!confirmed) return

    const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" })
    if (res.ok) {
      fetchForms()
      router.refresh()
    }
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.slice(0, 2).toUpperCase() ?? "?"

  function handleNavClick() {
    onMobileClose?.()
  }

  function isActive(path: string) {
    if (path === "/dashboard" && pathname === "/dashboard") return true
    if (path !== "/dashboard" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      <aside
        className={`w-64 border-r border-border bg-sidebar flex flex-col h-full ${className ?? ""}`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <Avatar className="size-9">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/dashboard") && pathname === "/dashboard"
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            All Messages
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-auto text-xs px-1.5 py-0.5"
              >
                {unreadCount}
              </Badge>
            )}
          </Link>

          <Link
            href="/dashboard/forms"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/dashboard/forms")
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Forms
          </Link>

          {forms.length > 0 && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Forms
              </p>
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard?form=${form.slug}`}
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <div className="size-2 rounded-full bg-primary shrink-0" />
                  <span className="truncate flex-1">{form.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {form._count.messages}
                  </span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <Button
            variant="default"
            className="w-full"
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Form
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </Button>
        </div>
      </aside>

      <CreateFormModal
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onCreated={() => {
          fetchForms()
          router.refresh()
        }}
      />
    </>
  )
}
