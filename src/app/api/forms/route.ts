import { NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { requireUserId } from "@/lib/auth-utils"

export async function GET() {
  try {
    const userId = await requireUserId()

    const db = await getDb()
    const forms = await db
      .collection("forms")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    const formsWithCount = await Promise.all(
      forms.map(async (form) => {
        const id = form._id.toString()
        const count = await db
          .collection("messages")
          .countDocuments({ formId: id })
        return {
          ...form,
          id,
          _id: id,
          _count: { messages: count },
        }
      })
    )

    return NextResponse.json(formsWithCount)
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(200),
  description: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    const body = await request.json()

    const result = createFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, description } = result.data
    const slug = nanoid(12)

    const db = await getDb()
    const insertResult = await db.collection("forms").insertOne({
      userId,
      name,
      slug,
      description: description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
    const endpoint = `${baseUrl}/api/forms/${slug}/submit`

    return NextResponse.json(
      {
        _id: insertResult.insertedId.toString(),
        id: insertResult.insertedId.toString(),
        userId,
        name,
        slug,
        description: description ?? null,
        endpoint,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server response" }, { status: 500 })
  }
}
