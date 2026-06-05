"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageCard } from "@/components/message-card"

interface FormItem {
  id: string
  name: string
  slug: string
}

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

interface MessagesResponse {
  messages: Message[]
  total: number
  page: number
  totalPages: number
}

const PAGE_SIZE = 20

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialFormSlug = searchParams.get("form") ?? ""

  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [forms, setForms] = useState<FormItem[]>([])
  const [search, setSearch] = useState("")
  const [formFilter, setFormFilter] = useState(initialFormSlug)
  const [readFilter, setReadFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (formFilter && formFilter !== "all") params.set("slug", formFilter)
    if (readFilter !== "all") params.set("read", readFilter)
    params.set("sort", sortOrder)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))

    const res = await fetch(`/api/messages?${params}`)
    if (res.ok) {
      const data: MessagesResponse = await res.json()
      setMessages(data.messages)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    }
    setLoading(false)
  }, [search, formFilter, readFilter, sortOrder, page])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    fetch("/api/forms")
      .then((res) => res.ok && res.json())
      .then((data) => setForms(data ?? []))
      .catch(() => {})
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, formFilter, readFilter, sortOrder])

  const selectedFormName = formFilter
    ? forms.find((f) => f.slug === formFilter)?.id ?? ""
    : ""

  // Sync form filter with URL param
  useEffect(() => {
    if (initialFormSlug && !formFilter) {
      setFormFilter(initialFormSlug)
    }
  }, [initialFormSlug, formFilter])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="border-b border-border px-4 py-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={formFilter || "all"} onValueChange={(v) => setFormFilter(v ?? "")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All forms">
                  {!formFilter || formFilter === "all"
                    ? "All forms"
                    : forms.find((f) => f.slug === formFilter)?.name ?? "All forms"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All forms</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.slug}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={readFilter} onValueChange={(v) => setReadFilter(v ?? "all")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All status">
                  {readFilter === "all" ? "All" : readFilter === "false" ? "Unread" : "Read"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v ?? "newest")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort">
                  {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Message count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
        {total} {total === 1 ? "message" : "messages"}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <svg className="size-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">
              Create a form and post some data to its endpoint.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onUpdate={fetchMessages}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-border px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
