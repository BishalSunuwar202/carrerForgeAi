"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string, pdfFile?: File) => void
  isLoading?: boolean
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !pdfFile) return
    if (isLoading) return

    onSendMessage(message.trim(), pdfFile || undefined)
    setMessage("")
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    } else {
      alert("Please upload a PDF file")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileRemove = () => {
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="sticky bottom-0 w-full border-t border-border bg-background">
      {/* PDF Preview */}
      {pdfFile && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">📄</span>
            <span className="text-sm font-medium truncate">{pdfFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(pdfFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileRemove}
            className="h-6 w-6"
          >
            <span className="text-sm">×</span>
          </Button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl px-4 py-4"
      >
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="shrink-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Text Input */}
          <Input
            type="text"
            placeholder="Describe your skills or ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            className="min-h-[48px] resize-none rounded-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          {/* Send Button */}
          <Button
            type="submit"
            disabled={(!message.trim() && !pdfFile) || isLoading}
            size="icon"
            className={cn("shrink-0", !message.trim() && !pdfFile && "opacity-50")}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
