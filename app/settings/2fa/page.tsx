"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Shield, Copy, Check } from "lucide-react"

export default function TwoFactorAuthPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [secretKey, setSecretKey] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetch2FA = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("two_factor_auth").select("*").eq("user_id", user.id).maybeSingle()

      if (data) {
        setIs2FAEnabled(data.is_enabled)
        setBackupCodes(data.backup_codes || [])
      }
    }

    fetch2FA()
  }, [supabase])

  const handleEnable2FA = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Generate secret key (in production, use speakeasy or similar)
      const secret = Math.random().toString(36).substring(2, 15).toUpperCase()
      const codes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase())

      const { error } = await supabase
        .from("two_factor_auth")
        .upsert([
          {
            user_id: user.id,
            secret_key: secret,
            is_enabled: true,
            backup_codes: codes,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setSecretKey(secret)
      setBackupCodes(codes)
      setIs2FAEnabled(true)
    } catch (error) {
      console.error("Error enabling 2FA:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("two_factor_auth").update({ is_enabled: false }).eq("user_id", user.id)

      if (error) throw error
      setIs2FAEnabled(false)
      setSecretKey("")
      setBackupCodes([])
    } catch (error) {
      console.error("Error disabling 2FA:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-gradient-to-b from-black to-gray-900 border border-cyan-500/30 p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          </div>

          <div className="space-y-6">
            {!is2FAEnabled ? (
              <div>
                <p className="text-gray-300 mb-4">
                  Add an extra layer of security to your account with two-factor authentication.
                </p>
                <Button
                  onClick={handleEnable2FA}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Enable 2FA
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-green-400 font-semibold mb-4">2FA is enabled ✓</p>

                {secretKey && (
                  <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400 mb-2">Secret Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-cyan-400 text-sm">{secretKey}</code>
                      <button onClick={() => copyToClipboard(secretKey)} className="text-cyan-400 hover:text-cyan-300">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {backupCodes.length > 0 && (
                  <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-400 mb-2">Backup Codes (Save these in a safe place):</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {backupCodes.map((code, i) => (
                        <code key={i} className="font-mono text-sm text-gray-300 bg-black p-2 rounded">
                          {code}
                        </code>
                      ))}
                    </div>
                    <button
                      onClick={() => copyToClipboard(backupCodes.join("\n"))}
                      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy All
                    </button>
                  </div>
                )}

                <Button onClick={handleDisable2FA} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  Disable 2FA
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
