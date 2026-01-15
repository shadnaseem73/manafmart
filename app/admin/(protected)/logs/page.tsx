export const metadata = {
  title: "Logs - Command Deck",
  description: "Admin audit logs",
}

export default function LogsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-100">Audit Logs</h1>
        <p className="text-gray-400 mt-2">
          Placeholder screen. The updated database migrations include an <code>admin_audit_logs</code> table and helper function to log actions.
        </p>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <p className="text-gray-400 text-sm">
          Tip: log sensitive actions like order status changes, product updates, and admin config toggles.
        </p>
      </div>
    </div>
  )
}
