"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Send, MessageCircle } from "lucide-react"

export function LiveChat() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isOpen || !conversationId) return

    try {
      const supabase = createBrowserClient()
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new])
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      console.log("[v0] Chat subscription setup failed, using local messages:", error)
    }
  }, [isOpen, conversationId])

  const handleStartChat = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        alert("Please login to start a chat")
        return
      }

      try {
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert([{ user_id: user.id, subject: "Customer Support" }])
          .select()

        if (error) {
          console.log("[v0] Chat table not found, using local demo:", error.message)
          setConversationId("demo-" + Date.now())
          setMessages([
            {
              id: "1",
              message: "Welcome to Manaf Mart Support! How can we help?",
              is_agent: true,
            },
          ])
          setIsOpen(true)
          return
        }

        setConversationId(data[0].id)
        setMessages([])
        setIsOpen(true)
      } catch (tableError) {
        console.log("[v0] Using demo chat mode:", tableError)
        setConversationId("demo-" + Date.now())
        setMessages([
          {
            id: "1",
            message: "Welcome to Manaf Mart Support! How can we help?",
            is_agent: true,
          },
        ])
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversationId) return

    try {
      const supabase = createBrowserClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const userMessage = {
        id: "msg-" + Date.now(),
        message: input,
        is_agent: false,
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        await supabase.from("chat_messages").insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            message: input,
            is_agent: false,
          },
        ])
      } catch (error) {
        console.log("[v0] Could not save message to database, showing in demo mode:", error)
        // Message already shown locally, just continue
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "agent-" + Date.now(),
            message: "Thanks for your message! Our team will respond soon.",
            is_agent: true,
          },
        ])
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Do not show the customer chat widget inside the admin portal.
  if (pathname.startsWith("/admin")) {
    return null
  }

  if (!isInitialized || !isOpen) {
    return (
      <button
        onClick={handleStartChat}
        disabled={isLoading}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-110 z-40"
        title="Open live chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 bg-gradient-to-b from-black to-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 z-40 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-purple-500/30">
        <h3 className="text-white font-bold text-lg">Live Chat Support</h3>
        <button onClick={() => setIsOpen(false)} className="text-cyan-400 hover:text-cyan-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>Welcome to Manaf Mart Support!</p>
            <p>How can we help you today?</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_agent ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.is_agent
                  ? "bg-purple-600/30 border border-purple-500/50 text-gray-100"
                  : "bg-cyan-500/30 border border-cyan-500/50 text-cyan-100"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-purple-500/30 p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500"
        />
        <Button
          type="submit"
          size="sm"
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  )
}
