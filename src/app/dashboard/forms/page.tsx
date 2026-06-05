"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CreateFormModal } from "@/components/create-form-modal"

interface Form {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  _count: { messages: number }
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  async function fetchForms() {
    const res = await fetch("/api/forms")
    if (res.ok) {
      const data = await res.json()
      setForms(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchForms()
  }, [])

  async function deleteForm(formId: string, formName: string) {
    const confirmed = window.confirm(
      `Delete "${formName}" and ALL its messages? This cannot be undone.`
    )
    if (!confirmed) return

    const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Form deleted")
      fetchForms()
    } else {
      toast.error("Failed to delete form")
    }
  }

  async function copyEndpoint(slug: string) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      window.location.origin
    const url = `${baseUrl}/api/forms/${slug}/submit`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Endpoint URL copied!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      : ""

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Forms</h1>
        <Button variant="default" size="sm" onClick={() => setShowCreateForm(true)}>
          <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Form
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <svg className="size-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">No forms yet</p>
            <p className="text-xs mt-1">
              Create your first form to start receiving messages.
            </p>
            <Button
              variant="default"
              size="sm"
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              Create New Form
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="border-border bg-card hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold leading-none">{form.name}</h3>
                      {form.description && (
                        <p className="text-xs text-muted-foreground">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {form._count.messages}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-black/50 border border-border rounded-lg p-2.5">
                    <code className="text-xs font-mono text-green-400 break-all">
                      {baseUrl}/api/forms/{form.slug}/submit
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyEndpoint(form.slug)}
                    >
                      Copy
                    </Button>
                    <Link
                      href={`/dashboard?form=${form.slug}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        View Messages
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => deleteForm(form.id, form.name)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateFormModal
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onCreated={() => {
          fetchForms()
        }}
      />
    </div>
  )
}
