export const metadata = {
  title: "Team - Command Deck",
  description: "Admin team management",
}

export default function TeamPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="glass-panel neon-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-100">Team</h1>
        <p className="text-gray-400 mt-2">
          Placeholder screen. The merged admin migration adds <code>admin_role</code>, <code>avatar_url</code>, and <code>last_active</code> fields to <code>profiles</code>.
        </p>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <p className="text-gray-400 text-sm">
          Next: build an admin staff list, role management (staff / manager / admin / super_admin), and activity tracking.
        </p>
      </div>
    </div>
  )
}
