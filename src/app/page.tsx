"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ErrorBoundary } from "@/components/error-boundary"
import { JobSelector } from "@/components/job-selector"
import type { JobPosting } from "@/data/mock-jobs"
import {
  getChatListForSidebar,
  getChatById,
  saveChat,
  deleteChat,
  getActiveChatId,
  setActiveChatId,
  type StoredMessage,
} from "@/lib/storage"
import type { ChatListItem } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1500

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function parseApiError(body: string): { error?: string; details?: string } {
  try {
    return JSON.parse(body) as { error?: string; details?: string }
  } catch {
    return {}
  }
}

function chatTitleFromMessages(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user")
  if (!first) return "New Chat"
  const text = first.content.replace(/\s+/g, " ").trim()
  return text.slice(0, 50) + (text.length > 50 ? "…" : "")
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatList, setChatList] = useState<ChatListItem[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Restore active chat from localStorage on mount
  useEffect(() => {
    const activeId = getActiveChatId()
    if (activeId) {
      const chat = getChatById(activeId)
      if (chat?.messages?.length) {
        setCurrentChatId(chat.id)
        setMessages(
          chat.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }))
        )
      }
    }
    setChatList(getChatListForSidebar())
  }, [])

  // Persist current chat when messages change
  useEffect(() => {
    if (messages.length === 0) return
    const id = currentChatId ?? `chat-${Date.now()}`
    if (!currentChatId) setCurrentChatId(id)
    const title = chatTitleFromMessages(messages)
    const stored: StoredMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }))
    const existing = getChatById(id)
    saveChat({
      id,
      title,
      messages: stored,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    })
    setActiveChatId(id)
    setChatList(getChatListForSidebar())
  }, [messages, currentChatId])

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setActiveChatId(null)
    setChatList(getChatListForSidebar())
  }

  const handleSelectChat = useCallback((id: string) => {
    const chat = getChatById(id)
    if (chat) {
      setCurrentChatId(chat.id)
      setMessages(
        chat.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))
      )
      setActiveChatId(id)
    }
  }, [])

  const handleDeleteChat = useCallback((id: string) => {
    deleteChat(id)
    setChatList(getChatListForSidebar())
    if (currentChatId === id) {
      setMessages([])
      setCurrentChatId(null)
      setActiveChatId(null)
    }
  }, [currentChatId])

  const handleExportMarkdown = useCallback(() => {
    const lines = messages.map((m) => {
      const role = m.role === "user" ? "You" : "CareerForgeAI"
      return `## ${role}\n\n${m.content}`
    })
    const md = lines.join("\n\n---\n\n")
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `careerforge-chat-${currentChatId ?? Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages, currentChatId])

  const handleValidationError = useCallback((msg: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Validation:** ${msg}`,
      },
    ])
  }, [])

  const handleSendMessage = async (message: string, pdfFile?: File) => {
    if (!message.trim() && !pdfFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message || (pdfFile ? `Uploaded PDF: ${pdfFile.name}` : ""),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const formData = new FormData()
        if (message) formData.append("message", message)
        if (pdfFile) formData.append("pdf", pdfFile)
        if (selectedJob?.id) formData.append("jobId", selectedJob.id)
        formData.append("messages", JSON.stringify(updatedMessages))

        const response = await fetch("/chat", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          const { error, details } = parseApiError(errorText)
          const msg = [error, details].filter(Boolean).join(" — ") || errorText
          throw new Error(msg)
        }

      // Handle streaming response (text stream format - simpler than UI message stream)
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantId = (Date.now() + 1).toString()
      let hasReceivedContent = false

      console.log("Starting to read text stream...")

      // Process the stream - text stream is simpler, just append chunks
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("Stream ended. Total content length:", assistantContent.length)
          break
        }

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          
          if (chunk) {
            assistantContent += chunk
            hasReceivedContent = true
            
            // Update UI with accumulated content as it streams
            setMessages((prev) => {
              const withoutAssistant = prev.filter((m) => m.id !== assistantId)
              return [
                ...withoutAssistant,
                {
                  id: assistantId,
                  role: "assistant",
                  content: assistantContent,
                },
              ]
            })
          }
        }
      }

      // Ensure final message is saved
      if (assistantContent.trim()) {
        setMessages((prev) => {
          const withoutAssistant = prev.filter((m) => m.id !== assistantId)
          return [
            ...withoutAssistant,
            {
              id: assistantId,
              role: "assistant",
              content: assistantContent.trim(),
            },
          ]
        })
      } else if (!hasReceivedContent) {
        console.error("No content received from stream.")
        setMessages((prev) => {
          const withoutAssistant = prev.filter((m) => m.id !== assistantId)
          return [
            ...withoutAssistant,
            {
              id: assistantId,
              role: "assistant",
              content: "No response received. Please check:\n1. Your API key is set in .env.local\n2. Restart the dev server after adding the API key\n3. Check browser console and server logs for errors",
            },
          ]
        })
      }

        break
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        }
      }
    }

    if (lastError) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `**Something went wrong**\n\n${lastError.message}\n\nYou can try again or start a new chat.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        onNewChat={handleNewChat}
        chatHistory={chatList}
        activeChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <ErrorBoundary>
        <main className="flex flex-1 flex-col lg:pl-64">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4 max-w-md px-4">
                <h2 className="text-2xl font-semibold">Welcome to CareerForgeAI</h2>
                <p className="text-muted-foreground">
                  Upload your resume (PDF) or describe your skills, and I&apos;ll analyze them
                  against job postings to identify skill gaps and recommend a learning path.
                </p>
                <div className="flex flex-col gap-2 mt-8 text-sm text-muted-foreground">
                  <p>✨ Try saying:</p>
                  <ul className="list-disc list-inside space-y-1 text-left max-w-xs mx-auto">
                    <li>&quot;I know React, TypeScript, and Node.js&quot;</li>
                    <li>&quot;Upload my resume and analyze my skills&quot;</li>
                    <li>&quot;What skills do I need for a senior developer role?&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-end px-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={handleExportMarkdown}
                >
                  <Download className="h-4 w-4" />
                  Export as Markdown
                </Button>
              </div>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm">
                    {messages[messages.length - 1]?.content?.startsWith("Uploaded PDF")
                      ? "Reading PDF & analyzing skills…"
                      : "Analyzing skills…"}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="space-y-2 px-4 pb-2">
          <JobSelector
            selectedJobId={selectedJob?.id ?? null}
            onSelectJob={setSelectedJob}
          />
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onValidationError={handleValidationError}
        />
      </main>
      </ErrorBoundary>
    </div>
  )
}
