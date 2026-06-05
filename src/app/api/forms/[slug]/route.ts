import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { requireUserId } from "@/lib/auth-utils"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireUserId()
    const { slug } = await params

    let objectId: ObjectId
    try {
      objectId = new ObjectId(slug)
    } catch {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    const db = await getDb()
    const form = await db.collection("forms").findOne({ _id: objectId })
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    if (form.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await db.collection("messages").deleteMany({ formId: slug })
    await db.collection("forms").deleteOne({ _id: objectId })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
