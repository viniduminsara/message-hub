"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface CreateFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateFormModal({
  open,
  onOpenChange,
  onCreated,
}: CreateFormModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [endpoint, setEndpoint] = useState("")
  const [copied, setCopied] = useState(false)

  function reset() {
    setStep("form")
    setName("")
    setDescription("")
    setLoading(false)
    setEndpoint("")
    setCopied(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      reset()
    }
    onOpenChange(open)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? "Failed to create form")
      return
    }

    const form = await res.json()
    setEndpoint(form.endpoint)
    setStep("success")
    onCreated()
  }

  async function copyEndpoint() {
    try {
      await navigator.clipboard.writeText(endpoint)
      setCopied(true)
      toast.success("Endpoint URL copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`border-border bg-card ${step === "success" ? "sm:max-w-lg" : "sm:max-w-md"}`}
      >
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new form</DialogTitle>
              <DialogDescription>
                Each form gets a unique API endpoint to receive submissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form name</Label>
                <Input
                  id="form-name"
                  placeholder="e.g. Portfolio Contact Form"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-desc">Description (optional)</Label>
                <Textarea
                  id="form-desc"
                  placeholder="What is this form for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create form"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Form created!</DialogTitle>
              <DialogDescription>
                Your form endpoint is ready. Send POST requests with a JSON body
                to this URL to receive messages in your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-black/50 border border-border rounded-lg p-3">
                <code className="text-sm font-mono text-green-400 break-all">
                  {endpoint}
                </code>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={copyEndpoint}
                >
                  {copied ? "Copied!" : "Copy endpoint"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Done
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground font-mono">
                  {`fetch("${endpoint}", {`}
                  <br />
                  &nbsp;&nbsp;method: "POST",
                  <br />
                  &nbsp;&nbsp;headers: {"{"}"Content-Type": "application/json"
                  {"}"},
                  <br />
                  &nbsp;&nbsp;body: JSON.stringify({"{"} ... {"}"})
                  <br />
                  {`})`}
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
