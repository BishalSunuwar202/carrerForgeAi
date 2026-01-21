"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquarePlus, Menu, X, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onNewChat: () => void
  chatHistory?: string[]
}

export function Sidebar({ onNewChat, chatHistory = [] }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false) // Start closed on mobile, will be open on desktop via CSS

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
          <div className="flex h-16 items-center gap-2 border-b border-border px-4">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5" />
              <h1 className="text-lg font-semibold">CareerForgeAI</h1>
            </div>
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
                chatHistory.map((chat, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      // Handle chat selection
                      console.log("Selected chat:", chat)
                    }}
                  >
                    {chat}
                  </Button>
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
