import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireUserId } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId()

    const { searchParams } = new URL(request.url)
    const formSlug = searchParams.get("slug")
    const formId = searchParams.get("formId")
    const read = searchParams.get("read")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") === "oldest" ? 1 : -1
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))

    const db = await getDb()

    const userForms = await db
      .collection("forms")
      .find({ userId })
      .project({ _id: 1, slug: 1, name: 1 })
      .toArray()
    const userFormSlugs = userForms.map((f) => f.slug)
    const userFormIds = userForms.map((f) => f._id.toString())

    let targetFormId = formId
    if (formSlug) {
      const found = userForms.find((f) => f.slug === formSlug)
      if (found) targetFormId = found._id.toString()
    }

    const match: Record<string, unknown> = {
      formId: { $in: userFormIds },
    }

    if (targetFormId && userFormIds.includes(targetFormId)) {
      match.formId = targetFormId
    }

    if (read === "true") match.read = true
    if (read === "false") match.read = false

    if (search) {
      const regex = { $regex: search, $options: "i" }
      match.$or = [
        { senderName: regex },
        { senderEmail: regex },
        { subject: regex },
      ]
    }

    const total = await db.collection("messages").countDocuments(match)

    const messages = await db
      .collection("messages")
      .find(match)
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const mapped = messages.map((m) => ({
      id: m._id.toString(),
      _id: m._id.toString(),
      formId: m.formId,
      body: m.body,
      senderEmail: m.senderEmail ?? null,
      senderName: m.senderName ?? null,
      subject: m.subject ?? null,
      read: m.read,
      ipAddress: m.ipAddress ?? null,
      createdAt: m.createdAt,
      form: {
        name: m.formName ?? "Unknown",
        slug: m.formSlug ?? "",
      },
    }))

    return NextResponse.json({
      messages: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
