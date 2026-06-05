import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { requireUserId } from "@/lib/auth-utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const userId = await requireUserId()
    const { messageId } = await params

    let objectId: ObjectId
    try {
      objectId = new ObjectId(messageId)
    } catch {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const db = await getDb()

    const message = await db.collection("messages").findOne({ _id: objectId })
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const form = await db.collection("forms").findOne({ _id: new ObjectId(message.formId) })
    if (!form || form.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { read } = body

    if (typeof read !== "boolean") {
      return NextResponse.json(
        { error: "read field must be a boolean" },
        { status: 400 }
      )
    }

    await db
      .collection("messages")
      .updateOne({ _id: objectId }, { $set: { read } })

    const updated = await db.collection("messages").findOne({ _id: objectId })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const userId = await requireUserId()
    const { messageId } = await params

    let objectId: ObjectId
    try {
      objectId = new ObjectId(messageId)
    } catch {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const db = await getDb()

    const message = await db.collection("messages").findOne({ _id: objectId })
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    const form = await db.collection("forms").findOne({ _id: new ObjectId(message.formId) })
    if (!form || form.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await db.collection("messages").deleteOne({ _id: objectId })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
