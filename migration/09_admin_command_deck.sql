-- ============================================================
-- MANAF MART - ADMIN COMMAND DECK (MERGED MIGRATION)
-- Adds admin-focused tables + columns used by the merged UI
-- Safe to run multiple times (uses IF NOT EXISTS / guarded ALTERs)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1) Upgrade PROFILES (admin metadata)
-- ============================================================
DO $$
BEGIN
    -- Display name for logs / UI
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;

    -- Role-based access for admin features
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'admin_role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN admin_role TEXT DEFAULT 'staff';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'last_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_active TIMESTAMPTZ;
    END IF;
END $$;

-- Auto-upgrade high-trust profiles to admin
UPDATE profiles
SET admin_role = 'admin'
WHERE COALESCE(admin_role, 'staff') = 'staff'
  AND COALESCE(trust_score, 0) >= 90;

-- ============================================================
-- 2) Upgrade CATEGORIES
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'is_hidden'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_hidden BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================
-- 3) Upgrade ORDERS (shipping, trust, payment)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'delivery_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'Pending';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'Unpaid';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'trust_score'
    ) THEN
        ALTER TABLE orders ADD COLUMN trust_score INTEGER DEFAULT 100;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'shipped_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================
-- 4) SITE SETTINGS (branding, logo)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    metadata JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value, metadata)
VALUES ('logo', '/logo.jpeg', '{"alt": "Manaf Mart Logo", "width": 48, "height": 48}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 5) SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved', 'Pending')),
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6) ADMIN AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    admin_name TEXT,
    action TEXT NOT NULL,
    target_resource TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7) ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8) RLS: SITE SETTINGS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" ON site_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings" ON site_settings
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.admin_role IN ('admin', 'super_admin', 'manager')
    )
);

-- ============================================================
-- 9) RLS: SUPPORT TICKETS
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets" ON support_tickets
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.admin_role IN ('admin', 'super_admin', 'manager')
    )
);

DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;
CREATE POLICY "Admins can update all tickets" ON support_tickets
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.admin_role IN ('admin', 'super_admin', 'manager')
    )
);

DROP POLICY IF EXISTS "Admins can insert tickets" ON support_tickets;
CREATE POLICY "Admins can insert tickets" ON support_tickets
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.admin_role IN ('admin', 'super_admin', 'manager')
    )
);

DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
CREATE POLICY "Users can create own tickets" ON support_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10) RLS: ADMIN AUDIT LOGS
-- ============================================================
DROP POLICY IF EXISTS "Admins view logs" ON admin_audit_logs;
CREATE POLICY "Admins view logs" ON admin_audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.admin_role IN ('admin', 'super_admin', 'manager')
    )
);

DROP POLICY IF EXISTS "System create logs" ON admin_audit_logs;
CREATE POLICY "System create logs" ON admin_audit_logs
FOR INSERT WITH CHECK (true);

-- ============================================================
-- 11) REALTIME (new order ding + ticket updates)
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE orders;
        EXCEPTION WHEN duplicate_object THEN
            -- already added
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    ELSE
        CREATE PUBLICATION supabase_realtime FOR TABLE orders, support_tickets;
    END IF;
END $$;

-- ============================================================
-- 12) INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_trust_score ON orders(trust_score);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- ============================================================
-- 13) HELPER FUNCTION: Log Admin Actions
-- ============================================================
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action TEXT,
    p_target_resource TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_admin_name TEXT;
    v_log_id UUID;
BEGIN
    SELECT COALESCE(p.full_name, u.email, p.phone, 'Unknown Admin')
      INTO v_admin_name
      FROM profiles p
      LEFT JOIN auth.users u ON u.id = p.id
     WHERE p.id = auth.uid();

    INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_resource, details)
    VALUES (auth.uid(), v_admin_name, p_action, p_target_resource, p_details)
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 14) TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 09_admin_command_deck.sql COMPLETE
-- ============================================================
