import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const chats = await db.chat.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(
      chats.map((c) => ({ id: c.id, title: c.title }))
    )
  } catch (error) {
    console.error("GET /api/chats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, messages } = body as {
      title?: string
      messages?: { role: string; content: string }[]
    }

    const chat = await db.chat.create({
      data: {
        title: title ?? "New Chat",
        messages: {
          create:
            messages?.map((m) => ({
              role: m.role,
              content: m.content,
            })) ?? [],
        },
      },
      include: { messages: true },
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error("POST /api/chats error:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}
