"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleNewChat = () => {
    setMessages([])
  }

  const handleSendMessage = async (message: string, pdfFile?: File) => {
    if (!message.trim() && !pdfFile) return

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message || (pdfFile ? `Uploaded PDF: ${pdfFile.name}` : ""),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      if (message) formData.append("message", message)
      if (pdfFile) formData.append("pdf", pdfFile)
      formData.append("messages", JSON.stringify(updatedMessages))

      // Send to chat API
      const response = await fetch("/chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`Failed to process request: ${response.status} ${errorText}`)
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
        // No content received - log for debugging
        console.error("No content received from stream. Check server logs for errors.")
        setMessages((prev) => {
          const withoutAssistant = prev.filter((m) => m.id !== assistantId)
          return [
            ...withoutAssistant,
            {
              id: assistantId,
              role: "assistant",
              content: "No response received. Please check:\n1. Your API key is set in .env.local\n2. The dev server was restarted after adding the API key\n3. Check browser console and server logs for errors",
            },
          ]
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} chatHistory={[]} />

      {/* Main Chat Area */}
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
                  <span className="text-sm">Analyzing skills...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  )
}
