"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface MessageForm {
  name: string
  slug: string
}

interface Message {
  id: string
  formId: string
  body: Record<string, unknown>
  senderEmail: string | null
  senderName: string | null
  subject: string | null
  read: boolean
  ipAddress: string | null
  createdAt: string
  form: MessageForm
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function getFormBadgeColor(formName: string) {
  const colors = [
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  ]
  let hash = 0
  for (let i = 0; i < formName.length; i++) {
    hash = formName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

export function MessageCard({
  message,
  onUpdate,
}: {
  message: Message
  onUpdate: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  async function toggleRead() {
    const res = await fetch(`/api/messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !message.read }),
    })
    if (res.ok) {
      message.read = !message.read
      onUpdate()
    } else {
      toast.error("Failed to update message")
    }
  }

  async function deleteMessage() {
    const confirmed = window.confirm("Delete this message forever?")
    if (!confirmed) return

    const res = await fetch(`/api/messages/${message.id}`, {
      method: "DELETE",
    })
    if (res.ok) {
      toast.success("Message deleted")
      onUpdate()
    } else {
      toast.error("Failed to delete message")
    }
  }

  const preview =
    message.subject ??
    (typeof message.body === "object" && message.body !== null
      ? Object.values(message.body).find(
          (v) => typeof v === "string" && v.length > 0
        ) ?? "No content"
      : "No content")

  return (
    <div
      className={`border-b border-border transition-colors ${
        message.read ? "message-read opacity-70" : "message-unread"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3"
      >
        <div
          className={`size-2 rounded-full mt-1.5 shrink-0 ${
            message.read ? "bg-transparent" : "bg-primary"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 font-medium ${getFormBadgeColor(message.form.name)}`}
            >
              {message.form.name}
            </Badge>
            {message.senderName && (
              <span className="text-sm font-medium truncate">
                {message.senderName}
              </span>
            )}
            {message.senderEmail && (
              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                {message.senderEmail}
              </span>
            )}
            {!message.senderName && !message.senderEmail && (
              <span className="text-sm text-muted-foreground">Anonymous</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {typeof preview === "string"
              ? preview
              : JSON.stringify(preview).slice(0, 100)}
          </p>
        </div>
        <div className="text-xs text-muted-foreground shrink-0 pt-0.5">
          {timeAgo(message.createdAt)}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-4">
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(message.body).map(([key, value]) => (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 align-top text-muted-foreground font-medium whitespace-nowrap w-1/4">
                        {key}
                      </td>
                      <td className="py-2 font-mono text-xs break-all whitespace-pre-wrap">
                        {typeof value === "string" && value.length > 100 ? (
                          <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                            {value}
                          </pre>
                        ) : (
                          renderValue(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-2" />

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                Form: <span className="text-foreground">{message.form.name}</span>
              </span>
              <span>
                Received:{" "}
                <span className="text-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </span>
              {message.ipAddress && (
                <span>
                  IP: <span className="text-foreground">{message.ipAddress}</span>
                </span>
              )}
              {message.senderEmail && (
                <span>
                  Email:{" "}
                  <span className="text-foreground">{message.senderEmail}</span>
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRead}
              >
                {message.read ? "Mark unread" : "Mark read"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={deleteMessage}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
