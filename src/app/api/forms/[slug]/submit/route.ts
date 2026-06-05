import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const db = await getDb()
    const form = await db.collection("forms").findOne({ slug })
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      )
    }

    const body = await request.json()
    const bodyRecord = body as Record<string, unknown>
    const keys = Object.keys(bodyRecord)

    const emailKey = keys.find((k) => k.toLowerCase() === "email")
    const nameKey = keys.find((k) => k.toLowerCase() === "name")
    const subjectKey = keys.find(
      (k) => k.toLowerCase() === "subject" || k.toLowerCase() === "message"
    )

    let subject: string | null = null
    if (subjectKey) {
      const val = String(bodyRecord[subjectKey])
      subject = val.length > 100 ? val.slice(0, 100) : val
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null

    const formId = form._id.toString()
    await db.collection("messages").insertOne({
      formId,
      formName: form.name,
      formSlug: form.slug,
      body: bodyRecord,
      senderEmail: emailKey ? String(bodyRecord[emailKey]) : null,
      senderName: nameKey ? String(bodyRecord[nameKey]) : null,
      subject,
      read: false,
      ipAddress,
      createdAt: new Date(),
    })

    return NextResponse.json(
      { success: true, message: "Message received" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    )
  }
}
