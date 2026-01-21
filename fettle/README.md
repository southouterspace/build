# Fettle

A request management system for product managers to organize, prioritize, and track incoming requests from different organizations.

## Features

- **Multi-tenant architecture** - Organizations with role-based access (admin/viewer)
- **Multiple inboxes** - Each org can have multiple inboxes with unique email addresses and custom field schemas
- **Email intake** - Inbound emails are automatically parsed and converted to requests using AI
- **Custom fields** - Define org-wide or inbox-specific fields for structured data capture
- **AI extraction** - Claude extracts structured data from emails based on your custom field definitions
- **Tags** - Categorize requests by division, team, or any taxonomy
- **Upvoting** - Stakeholders can upvote requests to signal priority
- **Comments** - Threaded discussions on requests
- **Status tracking** - Full lifecycle management with status history

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite, React, TypeScript, TanStack Router/Query, Tailwind CSS |
| Backend | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite), Drizzle ORM |
| Auth | Better Auth (email/password) |
| Email (inbound) | Cloudflare Email Workers, postal-mime |
| Email (outbound) | Resend |
| AI | Claude API (Anthropic) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Assets     │    │    Hono      │    │    Email     │      │
│  │   (React)    │    │    API       │    │   Worker     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│                      ┌──────▼──────┐                           │
│                      │     D1      │                           │
│                      │  (SQLite)   │                           │
│                      └─────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Email Flow:
───────────
Inbound:  sender → Cloudflare Email Routing → Email Worker → D1 + Claude AI
Outbound: App → Resend API → recipient
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (Cloudflare CLI)
- Cloudflare account with Workers and D1 access
- Anthropic API key (for Claude)
- Resend API key (for outbound email)

### Installation

```bash
# Clone and navigate to the project
cd fettle

# Install dependencies
bun install

# Copy environment template
cp wrangler.json wrangler.local.json
```

### Configuration

Edit `wrangler.json` (or use `wrangler.local.json` for local overrides):

```json
{
  "vars": {
    "BETTER_AUTH_SECRET": "your-secret-key-min-32-chars",
    "BETTER_AUTH_URL": "http://localhost:5173",
    "RESEND_API_KEY": "re_xxxxx",
    "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
    "APP_DOMAIN": "fettle.app"
  }
}
```

### Database Setup

```bash
# Create local D1 database
bunx wrangler d1 create fettle-db

# Update wrangler.json with the database_id from the output

# Run migrations
bunx wrangler d1 migrations apply fettle-db --local

# Or generate migrations from schema changes
bun run db:generate
bun run db:migrate
```

### Development

```bash
# Start development server (frontend + backend)
bun run dev

# The app will be available at http://localhost:5173
```

### Building

```bash
# Build for production
bun run build

# Type check
bunx tsc --noEmit
```

### Deployment

```bash
# Deploy to Cloudflare Workers
bunx wrangler deploy

# Run migrations on production D1
bunx wrangler d1 migrations apply fettle-db --remote
```

## Project Structure

```
fettle/
├── src/
│   ├── client/                 # React frontend
│   │   ├── lib/
│   │   │   ├── api.ts          # API client functions
│   │   │   └── auth-client.ts  # Better Auth client
│   │   └── routes/
│   │       ├── __root.tsx      # Root layout with tenant context
│   │       ├── index.tsx       # Home page
│   │       ├── login.tsx       # Login page
│   │       ├── register.tsx    # Registration page
│   │       ├── requests.tsx    # Request list
│   │       ├── requests.$id.tsx # Request detail
│   │       ├── submit.tsx      # Submit request form
│   │       └── admin.tsx       # Admin settings
│   │
│   ├── server/                 # Cloudflare Worker backend
│   │   ├── lib/
│   │   │   ├── auth.ts         # Better Auth setup
│   │   │   ├── db.ts           # Drizzle + D1 setup
│   │   │   ├── ai.ts           # Claude API integration
│   │   │   └── tenant.ts       # Multi-tenant middleware
│   │   ├── routes/
│   │   │   ├── auth.ts         # Auth endpoints
│   │   │   ├── requests.ts     # Request CRUD
│   │   │   ├── tags.ts         # Tag management
│   │   │   ├── custom-fields.ts # Custom field definitions
│   │   │   ├── inboxes.ts      # Inbox management
│   │   │   └── admin.ts        # Org & member management
│   │   ├── email-handler.ts    # Cloudflare Email Worker
│   │   └── index.ts            # Main worker entry
│   │
│   └── shared/                 # Shared code
│       ├── schema.ts           # Drizzle database schema
│       └── types.ts            # TypeScript types & Zod schemas
│
├── drizzle/                    # Database migrations
├── wrangler.json               # Cloudflare Workers config
├── vite.config.ts              # Vite configuration
└── package.json
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `organizations` | Tenant organizations |
| `users` | User accounts |
| `org_memberships` | User-org relationships with roles |
| `inboxes` | Email inboxes per organization |
| `requests` | Feature requests / tickets |
| `tags` | Categorization tags |
| `request_tags` | Request-tag associations |
| `custom_field_definitions` | Custom field schemas |
| `custom_field_values` | Custom field data |
| `upvotes` | Request upvotes |
| `comments` | Request comments |
| `status_history` | Request status changes |

### Key Relationships

```
Organization
  ├── OrgMemberships → Users
  ├── Inboxes
  │     └── Requests
  │           ├── Tags (via RequestTags)
  │           ├── CustomFieldValues
  │           ├── Upvotes
  │           ├── Comments
  │           └── StatusHistory
  ├── Tags
  └── CustomFieldDefinitions (org-wide or inbox-specific)
```

## Email Setup

### Cloudflare Email Routing

1. **Add your domain to Cloudflare** (if not already)

2. **Enable Email Routing**:
   - Go to your domain → Email → Email Routing
   - Enable Email Routing (Cloudflare will add MX records)

3. **Configure catch-all route**:
   - Add a catch-all rule that routes to your Worker
   - Pattern: `*` → Worker: `fettle`

4. **For subdomains** (e.g., `inbox@acme.fettle.app`):
   - Requires Cloudflare Pro+ for wildcard subdomains
   - Alternative: Use `{org}-{inbox}@fettle.app` format on free tier

### Email Address Formats

The system supports multiple email formats:

| Format | Example | Use Case |
|--------|---------|----------|
| Subdomain | `product@acme.fettle.app` | Pro+ plans |
| Plus addressing | `product+acme@inbound.fettle.app` | Free tier |
| Prefix | `product-acme@inbound.fettle.app` | Free tier |

### Outbound Email (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Add API key to `RESEND_API_KEY` env var

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Register new user |
| `/api/auth/sign-in/email` | POST | Sign in |
| `/api/auth/sign-out` | POST | Sign out |
| `/api/auth/session` | GET | Get current session |

### Requests

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/requests` | GET | List requests (with filters) |
| `/api/requests` | POST | Create request |
| `/api/requests/:id` | GET | Get request details |
| `/api/requests/:id` | PATCH | Update request |
| `/api/requests/:id` | DELETE | Delete request (admin) |
| `/api/requests/:id/upvote` | POST | Toggle upvote |
| `/api/requests/:id/comments` | POST | Add comment |

### Inboxes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inboxes` | GET | List inboxes |
| `/api/inboxes` | POST | Create inbox (admin) |
| `/api/inboxes/:id` | GET | Get inbox |
| `/api/inboxes/:id` | PATCH | Update inbox (admin) |
| `/api/inboxes/:id` | DELETE | Delete inbox (admin) |

### Tags

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tags` | GET | List tags |
| `/api/tags` | POST | Create tag (admin) |
| `/api/tags/:id` | PATCH | Update tag (admin) |
| `/api/tags/:id` | DELETE | Delete tag (admin) |

### Custom Fields

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/custom-fields` | GET | List fields (optional `?inboxId=`) |
| `/api/custom-fields` | POST | Create field (admin) |
| `/api/custom-fields/:id` | PATCH | Update field (admin) |
| `/api/custom-fields/:id` | DELETE | Delete field (admin) |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/org` | GET | Get current organization |
| `/api/admin/org` | PATCH | Update organization |
| `/api/admin/members` | GET | List members |
| `/api/admin/members` | POST | Invite member |
| `/api/admin/members/:id` | PATCH | Update member role |
| `/api/admin/members/:id` | DELETE | Remove member |
| `/api/admin/orgs` | POST | Create organization |

## Custom Fields

Custom fields allow you to capture structured data specific to your organization's needs.

### Field Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single-line text | Customer name |
| `textarea` | Multi-line text | Detailed description |
| `number` | Numeric value | Revenue impact |
| `select` | Single choice dropdown | Priority level |
| `multi_select` | Multiple choice | Affected products |
| `date` | Date picker | Target deadline |
| `boolean` | Checkbox | Is blocking? |

### AI Extraction

When `isAiExtracted` is enabled, Claude will attempt to extract the field value from incoming emails. Provide a clear `description` to guide extraction:

```json
{
  "name": "customer_tier",
  "label": "Customer Tier",
  "fieldType": "select",
  "options": ["Enterprise", "Business", "Starter"],
  "isAiExtracted": true,
  "description": "The customer's subscription tier, often mentioned as their plan level"
}
```

## Roles & Permissions

| Action | Admin | Viewer |
|--------|-------|--------|
| View requests | Yes | Yes |
| Submit requests | Yes | Yes |
| Upvote requests | Yes | Yes |
| Comment on requests | Yes | Yes |
| Update request status | Yes | No |
| Delete requests | Yes | No |
| Manage tags | Yes | No |
| Manage custom fields | Yes | No |
| Manage inboxes | Yes | No |
| Manage members | Yes | No |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Secret key for auth (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Base URL of your app |
| `RESEND_API_KEY` | Yes | Resend API key for outbound email |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for AI extraction |
| `APP_DOMAIN` | No | Your app domain (default: `fettle.app`) |

## License

MIT
