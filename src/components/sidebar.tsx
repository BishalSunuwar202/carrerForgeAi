"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquarePlus, Menu, X, History, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthButton } from "@/components/auth-button"

export interface ChatListItem {
  id: string
  title: string
}

interface SidebarProps {
  onNewChat: () => void
  chatHistory?: ChatListItem[]
  activeChatId?: string | null
  onSelectChat?: (id: string) => void
  onDeleteChat?: (id: string) => void
}

export function Sidebar({
  onNewChat,
  chatHistory = [],
  activeChatId = null,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background transition-transform duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              <h1 className="text-lg font-semibold">CareerForgeAI</h1>
            </div>
            <AuthButton />
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={() => {
                onNewChat()
                setIsOpen(false) // Close sidebar on mobile after clicking
              }}
              className="w-full justify-start gap-2"
              size="default"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <Separator />

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" />
              Recent Chats
            </div>
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-4">
                  No previous chats
                </p>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-md",
                      activeChatId === chat.id && "bg-accent"
                    )}
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start font-normal truncate"
                      onClick={() => {
                        onSelectChat?.(chat.id)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{chat.title}</span>
                    </Button>
                    {onDeleteChat && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
