export const metadata = {
  title: "Support - Command Deck",
  description: "Support ticket inbox",
}

export default function SupportPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-100">Support Inbox</h1>
        <p className="text-gray-400 mt-2">
          Placeholder screen. The updated database migrations include a <code>support_tickets</code> table with RLS policies for admins and users.
        </p>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <p className="text-gray-400 text-sm">
          Next: build a ticket queue view (Open / Pending / Resolved) and assign tickets to staff.
        </p>
      </div>
    </div>
  )
}
