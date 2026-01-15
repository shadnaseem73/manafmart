"use client"

import { useState, useEffect } from "react"
import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { X } from "lucide-react" // Assuming you use lucide-react or similar icons

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Window */}
      <div className="relative w-full max-w-md bg-black border border-neutral-800 rounded-xl shadow-2xl p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-neutral-800"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">Admin Access</h2>
          <p className="text-sm text-neutral-400">Master Switchboard Authentication</p>
        </div>

        {/* The Form */}
        <AdminLoginForm />
        
      </div>
    </div>
  )
}
