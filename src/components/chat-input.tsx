"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_PDF_SIZE_BYTES, PDF_MIME_TYPE } from "@/lib/chat-validation"

const MAX_PDF_SIZE_MB = MAX_PDF_SIZE_BYTES / 1024 / 1024

interface ChatInputProps {
  onSendMessage: (message: string, pdfFile?: File) => void
  isLoading?: boolean
  onValidationError?: (message: string) => void
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  onValidationError,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !pdfFile) return
    if (isLoading) return
    setFileError(null)

    onSendMessage(message.trim(), pdfFile || undefined)
    setMessage("")
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null)

    if (!file) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (file.type !== PDF_MIME_TYPE) {
      const msg = "Please upload a PDF file (.pdf only)."
      setFileError(msg)
      onValidationError?.(msg)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      const msg = `File is too large. Maximum size is ${MAX_PDF_SIZE_MB}MB.`
      setFileError(msg)
      onValidationError?.(msg)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setPdfFile(file)
  }

  const handleFileRemove = () => {
    setPdfFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="sticky bottom-0 w-full border-t border-border bg-background">
      {/* File validation error */}
      {fileError && (
        <div className="px-4 py-2 border-b border-destructive/50 bg-destructive/10 text-sm text-destructive">
          {fileError}
        </div>
      )}

      {/* PDF Preview */}
      {pdfFile && !fileError && (
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
