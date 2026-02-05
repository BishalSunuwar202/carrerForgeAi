const STORAGE_KEY_CHATS = "careerforge_chats"
const STORAGE_KEY_ACTIVE_CHAT = "careerforge_active_chat_id"
const MAX_CHATS = 50

export interface StoredMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface StoredChat {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: number
  updatedAt: number
}

function getChats(): StoredChat[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setChats(chats: StoredChat[]) {
  if (typeof window === "undefined") return
  try {
    const toStore = chats.slice(-MAX_CHATS)
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(toStore))
  } catch (e) {
    console.warn("Failed to save chats to localStorage", e)
  }
}

export function getAllChats(): StoredChat[] {
  return getChats()
}

export function getChatById(id: string): StoredChat | undefined {
  return getChats().find((c) => c.id === id)
}

export function saveChat(chat: StoredChat): void {
  const chats = getChats()
  const index = chats.findIndex((c) => c.id === chat.id)
  const updated = {
    ...chat,
    updatedAt: Date.now(),
  }
  if (index >= 0) {
    chats[index] = updated
  } else {
    chats.push({ ...updated, createdAt: Date.now() })
  }
  setChats(chats)
}

export function createChat(id: string, title: string, messages: StoredMessage[]): StoredChat {
  const chat: StoredChat = {
    id,
    title,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveChat(chat)
  return chat
}

export function deleteChat(id: string): void {
  setChats(getChats().filter((c) => c.id !== id))
  if (typeof window !== "undefined" && getActiveChatId() === id) {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_CHAT)
  }
}

export function getActiveChatId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY_ACTIVE_CHAT)
}

export function setActiveChatId(id: string | null): void {
  if (typeof window === "undefined") return
  if (id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CHAT, id)
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_CHAT)
  }
}

export function getChatListForSidebar(): { id: string; title: string }[] {
  return getChats()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((c) => ({ id: c.id, title: c.title }))
}
