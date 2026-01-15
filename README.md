# Manaf Mart - Elite Tech E-commerce for Bangladesh

Elite tech e-commerce ecosystem with neon cyberpunk aesthetic, advanced features, and blockchain-verified authenticity.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (for database and auth)
- Render account (for deployment)

### Installation

1. **Clone and install**
```bash
git clone <your-repo>
cd manaf-mart
npm install
```

2. **Setup environment variables**
Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_URL=your_postgres_connection_string
```

3. **Run database migrations**
```bash
npm run migrate
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Database Setup

All SQL migrations are in `/supabase/migrations/`:

1. **01_initial_schema.sql** - Core tables with RLS policies
2. **02_seed_categories.sql** - Product categories and subcategories
3. **03_functions.sql** - Business logic functions and triggers

### Running Migrations in Supabase

Option A: Using Supabase Dashboard
```
1. Go to SQL Editor
2. Copy content from /supabase/migrations/01_initial_schema.sql
3. Run the query
4. Repeat for 02_ and 03_ files
```

Option B: Using Supabase CLI
```bash
supabase migration up
```

## Features

### Master Switchboard Admin Dashboard
Access at `/admin` after login. Control all features globally:

- **Squad Buying** - Group purchase discounts
- **Partial COD** - Booking fees for orders >৳2000
- **AI Search** - Typo-tolerant, voice, and image search
- **Invoice PDF** - Dark-themed PDF generation
- **Blockchain Verify** - Authenticity verification
- **Elite Drops** - Limited quantity exclusive releases
- **Spy Dashboard** - Real-time traffic and cart monitoring

### Feature Toggles

The `useFeatureFlag` hook makes any component responsive to admin toggles:

```tsx
import { useFeatureFlag } from '@/hooks/use-feature-flag'

export function MyComponent() {
  const { isEnabled, loading } = useFeatureFlag('squad_buys_enabled')
  
  if (!loading && !isEnabled) {
    return null // Component hidden when feature is disabled
  }
  
  return <div>Feature content</div>
}
```

## Admin Access

Default admin setup:
1. Create a user in Supabase Auth
2. Set `trust_score >= 90` in profiles table
3. Access `/admin/login` to enter Master Switchboard

## Deployment to Render

### Using render.yaml

```bash
# Render will automatically detect render.yaml
git push origin main
```

Render will:
- Build with `npm run build`
- Run migrations with `npm run migrate`
- Deploy to your specified region

### Manual Setup

1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard
3. Deploy!

### Blue-Green Deployment

Render automatically handles zero-downtime deployments:
- Old instances continue serving requests
- New instances start up
- Traffic switches when new instances are healthy
- Old instances shut down

## Architecture

```
app/
├── page.tsx                 # Homepage
├── admin/
│   ├── page.tsx            # Master Switchboard
│   ├── login/page.tsx      # Admin login
│   └── layout.tsx
├── api/
│   └── features/route.ts   # Feature flags API
└── globals.css             # Neon cyberpunk theme

components/
├── header.tsx              # Sticky navbar
├── hero.tsx                # Hero section
├── categories-section.tsx  # Category grid
├── elite-drops.tsx         # Premium products
├── squad-buys.tsx          # Group buying
├── footer.tsx              # Footer
└── admin/
    ├── admin-dashboard.tsx
    ├── feature-toggle-grid.tsx
    ├── spy-dashboard.tsx
    └── admin-login-form.tsx

lib/
├── features.ts             # Feature flag utilities
└── supabase/
    ├── client.ts           # Browser client
    └── server.ts           # Server client

hooks/
└── use-feature-flag.ts     # Feature flag hook

supabase/migrations/
├── 01_initial_schema.sql   # Tables & RLS
├── 02_seed_categories.sql  # Categories
└── 03_functions.sql        # Triggers & logic
```

## Database Schema

### Core Tables

- **profiles** - User data with trust scores and wallet balances
- **categories/subcategories** - Product organization
- **products** - Product listings with 360° assets
- **orders/order_items** - Order management
- **squad_buys/squad_buy_members** - Group buying
- **invoices** - PDF invoice tracking
- **behavior_logs** - User activity tracking
- **master_config** - Feature toggles

## API Endpoints

### GET /api/features
Returns all feature flags as JSON:
```json
{
  "squad_buys_enabled": true,
  "partial_cod_enabled": true,
  "ai_search_enabled": true,
  ...
}
```

## Security

- Row Level Security (RLS) enabled on all tables
- Supabase Auth for user management
- Trust scores determine admin access
- Feature toggles prevent unauthorized access

## Styling

Neon cyberpunk theme with:
- Black background (#000000)
- Cyan primary (#00f2ff)
- Purple secondary (#b026ff)
- Glassmorphism effects
- Glow animations

## License

Proprietary - Manaf Mart Bangladesh

## Support

For issues and questions:
- Email: hello@manafmart.com
- GitHub Issues: [your-repo]/issues
