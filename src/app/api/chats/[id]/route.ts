import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const chat = await db.chat.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }
    return NextResponse.json(chat)
  } catch (error) {
    console.error("GET /api/chats/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, messages } = body as {
      title?: string
      messages?: { id?: string; role: string; content: string }[]
    }

    const updateData: { title?: string; messages?: { deleteMany: {} } } = {}
    if (title != null) updateData.title = title
    if (messages != null) {
      await db.message.deleteMany({ where: { chatId: id } })
      await db.message.createMany({
        data: messages.map((m) => ({
          chatId: id,
          role: m.role,
          content: m.content,
        })),
      })
    }

    if (updateData.title != null) {
      await db.chat.update({
        where: { id },
        data: { title: updateData.title },
      })
    }

    const chat = await db.chat.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    return NextResponse.json(chat)
  } catch (error) {
    console.error("PATCH /api/chats/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.chat.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("DELETE /api/chats/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    )
  }
}
