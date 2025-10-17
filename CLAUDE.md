# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurelia Platform is a multi-tenant SaaS application for managing customer conversations, AI agents, and integrations. Built with Next.js 15, tRPC, Prisma, and Supabase, it serves both internal teams (dashboard) and external SaaS clients.

**Package Manager:** `pnpm` (v10.12.1) - ALWAYS use `pnpm`, never `npm` or `yarn`.

**Timezone:** SouthAmerica/BuenosAires (UTC-3)

## Development Commands

### Core Development
```bash
pnpm dev              # Start development server (Turbo mode)
pnpm build            # Production build
pnpm start            # Start production server
pnpm preview          # Build + start production server
```

### Code Quality
```bash
pnpm check            # Run linter + type checking
pnpm lint             # Run Next.js linter
pnpm lint:fix         # Fix linting issues
pnpm typecheck        # Type check without emitting
pnpm format:check     # Check code formatting
pnpm format:write     # Format code with Prettier
```

### Database Operations
```bash
pnpm db:generate      # Generate Prisma client + create migration
pnpm db:migrate       # Deploy migrations to production
pnpm db:push          # Push schema changes (dev only)
pnpm db:studio        # Open Prisma Studio GUI
```

### Utility Scripts
```bash
pnpm clean:playground      # Clean playground data
pnpm setup:lead-agents     # Setup lead agents
pnpm test:openai          # Test OpenAI integration
```

## Architecture

### Route Groups (Next.js 15 App Router)

- **(auth)** - Authentication pages (login, etc.)
- **(dashboard)** - Internal admin dashboard for AURELIA/ADMIN users
- **(saas)** - Customer-facing SaaS application
- **(web)** - Public marketing pages (home, pricing, etc.)

### Feature-based modular structure

Each top-level route inside Route Groups is defined as a module.
A module represents a core domain area of the application (for example, `agentes/`, `configuracion/`, `contactos/`, etc.).

Every module encapsulates:

Its main route entry (page.tsx)

Its own internal logic and assets, organized under the _features/, _hooks/, _lib/, _services/, _adapters/, _layout/, and _store/ folders.

This ensures high cohesion within modules and low coupling between them.

#### Example structure:

`app/`
|-`clients/`
|-|-`page.tsx`
|-|-`_features/`
|-|-|-`chat-panel`
|-|-|-|-`components/`
|-|-|-|-|-`chat-header.tsx`
|-|-|-|-|-`composer.tsx`
|-|-|-|-`chat-panel.tsx`
|-|-`_hooks/`
|-|-`_lib/`
|-|-`_services/`
|-|-`_adapters/`
|-|-`_layout/`
|-|-`_store/` (optional, only if the feature maintains global/shared state)

Each module must be self-contained and domain-specific.

Each feature inside _features/ is an isolated functionality belonging to that module.

Submodules (like clients/new or clients/[id]) must follow the exact same structure, inheriting the modular design pattern.

Submodules should only import from their parent module’s shared folders (like _lib or _hooks), but never from other unrelated modules.

Clear boundaries between modules and submodules

Predictable folder hierarchy

Easier onboarding for developers

Simple refactoring and testing per feature

Compatible with Claude Code’s context mapping — it can automatically infer where logic should live or be moved

#### Rules & conventions:
- Each feature is **self-contained**: it should not directly import code from another feature's `_features` folder.
- Shared logic between multiple features should be extracted into `/shared/` or `/common/` at the root level.
- State management (`store/`) should exist **only when a feature requires cross-component or persistent state**.
- Hooks inside `hooks/` are **scoped to that feature**.
- `lib/` holds feature-specific utility functions (formatters, validators, mappers, etc.).
- `services/` handles external requests (e.g., API calls) specific to the feature.
- `adapters/` manage data transformations or integrations with other layers.
- `layout/` defines UI composition unique to the feature (containers, sections, layout wrappers, etc.).


#### Purpose:
This pattern enforces:
- **Clear separation of concerns**
- **High cohesion and low coupling**
- **Ease of refactor and testing per feature**
- **Scalability in large React/Next.js projects**

Claude should:
- Respect this structure when generating, refactoring, or moving files.
- Automatically detect the correct `_features` path for context-aware edits.
- Avoid mixing logic between unrelated features.

### Authentication & Authorization

- **NextAuth v5.0.0-beta.25** with JWT strategy
- User types: `AURELIA`, `ADMIN`, `CUSTOMER`
- Middleware (`src/middleware.ts`) protects routes:
  - Public: `/login`, `/home`, `/pricing`, `/industrias`, `/trial`
  - Protected: `/dashboard` (AURELIA/ADMIN only), `/saas` (all authenticated users)

### Data Layer

**Prisma ORM** with PostgreSQL:
- Schema: `prisma/schema.prisma`
- Multi-tenant via `clientId` on most models
- Key models: `Client`, `User`, `Contact`, `Conversation`, `Message`, `Agente`, `Pipeline`, `Opportunity`

**Supabase Integration** (`src/lib/supabase/`):
- Realtime subscriptions for conversations/messages
- Storage for media files (images, videos, audio, documents)
- Client management via `SupabaseClientManager`:
  - Browser client with realtime
  - Server client for SSR
  - Admin client with service role

### API Layer (tRPC v11)

**Location:** `src/server/api/`

**Structure:**
- `root.ts` - Main router combining all routers
- `trpc.ts` - tRPC context, middleware, procedures
- `routers/` - Feature-specific routers:
  - `agentes`, `clientes`, `contactos`, `conversaciones`, `dashboard-cliente`
  - `instances`, `integraciones`, `login`, `messages`, `oportunidades`
  - `permisos`, `pipelines`, `planes`, `playground`, `superadmin`, `usuarios`

**Procedures:** Protected by middleware checking user type and client access.

### State Management

**Zustand stores** (`src/store/`):
- `agent-creation-store` - Agent wizard state
- `agent-edition-store` - Agent editing state
- `client-store` - Current client context
- `conversations-filters-store` - Conversation filtering

**React Query** via tRPC for server state.

### Custom Hooks (`src/hooks/`)

**Realtime:**
- `use-realtime-invalidation` - Invalidate queries on realtime events
- `use-realtime-fallback` - Fallback mechanism for realtime
- `use-conversations` - Comprehensive conversation management with realtime

**Data Fetching:**
- `use-agentes-queries` - Agent queries and mutations
- `use-contactos-queries` - Contact queries and mutations
- `use-conversaciones-queries` - Conversation queries
- `use-usuarios-queries` - User queries and mutations
- `use-dashboard-queries` - Dashboard metrics and data

**Utilities:**
- `use-client` - Get current client context (multi-tenancy)
- `use-client-invalidation` - Client data cache invalidation
- `use-file-upload` - File upload to Supabase Storage
- `use-debounce` - Debounce values and callbacks for performance
- `use-toast` - Toast notification system
- `use-notifications` - Real-time notification system

### Services (`src/services/`)

- `evolution-api-service.ts` - WhatsApp integration via Evolution API
- `openai-api-services.ts` - OpenAI API calls for AI agents
- `utils.ts` - Service utilities

### Environment Variables

**Schema:** `src/env.js` (validated with Zod via @t3-oss/env-nextjs)

**Required:**
- `DATABASE_URL`, `DIRECT_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth.js secret
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `OPENAI_ADMIN_API_KEY`
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` - WhatsApp integration
- `ENCRYPTION_MASTER_KEY` - For sensitive data encryption
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Conventions

### TypeScript & React

- **Functional components** with TypeScript interfaces (no classes)
- **Prefer interfaces** over types
- **No enums** - use maps or string unions
- **Server Components by default** - minimize `'use client'`
- **Suspense boundaries** for async components
- **Dynamic imports** for heavy components

### File Structure

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Files: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- Variables: `camelCase` (e.g., `userName`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Directory Organization

```
src/
├── app/              # Next.js pages (route groups)
├── components/       # React components
│   └── ui/          # Shadcn UI components
├── domain/          # TypeScript types/interfaces
├── hooks/           # Custom React hooks
├── lib/             # Libraries & utilities
│   ├── ai/         # AI-related utilities
│   ├── supabase/   # Supabase clients & config
│   ├── openai/     # OpenAI utilities
│   └── utils/      # General utilities
├── server/          # Server-side code
│   └── api/        # tRPC routers & procedures
├── services/        # External service integrations
├── store/           # Zustand stores
└── trpc/            # tRPC client config
```

### UI & Styling

- **Tailwind CSS** with mobile-first approach
- **Shadcn UI + Radix UI** for components
- **Responsive design** required
- **Accessibility** (ARIA labels, semantic HTML)

### SaaS Security Rules

**CRITICAL:** In SaaS routes (`/saas/*`), NEVER expose:
- Internal IDs (template IDs, agent IDs, client IDs)
- Database metadata (timestamps, UUIDs, technical details)
- Technical implementation details
- Only show user-relevant, configured data

## Key Integrations

### Evolution API (WhatsApp)

- Manages WhatsApp instances via containerized Evolution API
- Models: `EvolutionApiIntegration`, `EvolutionApiInstance`, `EvolutionInstanceWebhook`
- Service: `src/services/evolution-api-service.ts`
- Webhooks handle incoming messages

### OpenAI Integration

- AI agents use OpenAI for conversations
- Service: `src/services/openai-api-services.ts`
- Configuration per agent: model, temperature, topP, maxTokens, prompt

### Supabase Realtime

- Real-time updates for conversations and messages
- Optimized for Vercel (1 event/sec, 60s heartbeat)
- RLS (Row Level Security) enforces multi-tenancy
- Channels scoped by `clientId` for security

## Development Workflow

### Before Making Changes
1. Read relevant files to understand context
2. Check Prisma schema for data models
3. Verify authentication/authorization requirements
4. Review existing patterns in similar features

### Making Changes
1. Use functional, declarative patterns
2. Validate inputs with Zod schemas
3. Handle errors appropriately (use error boundaries)
4. Follow existing naming conventions
5. Add TypeScript types/interfaces

### After Changes
1. Run `pnpm check` (lint + typecheck)
2. Test affected features
3. Verify database migrations if schema changed
4. Check console for errors/warnings

### NEVER Do
- Execute `pnpm dev` (user handles server)
- Use `npm` or `yarn` instead of `pnpm`
- Expose technical IDs in SaaS UI
- Skip input validation
- Use classes instead of functions
- Create unsolicited `.md` files
- Create files with `simple`, `optimized`, `enhaced`, you must refactor existing files. Never create files from scratch unless necessary

## Testing

- Type safety via TypeScript + strict mode
- Input validation via Zod schemas
- Database constraints via Prisma

## Multi-Tenancy

- Most models have `clientId` foreign key
- tRPC procedures validate client access
- Supabase RLS policies enforce data isolation
- User belongs to single client (`User.clientId`)
- Admin users (type: `AURELIA`/`ADMIN`) can access multiple clients

## Performance Considerations

- Use React Server Components where possible
- Lazy load heavy components
- Optimize images (WebP, size data, lazy loading)
- Minimize client-side JavaScript bundles
- Use Turbo mode for faster dev builds
  
## Common Patterns

### Creating a new tRPC route
1. Create router in `src/server/api/routers/[feature].ts`
2. Export from `src/server/api/routers/index.ts`
3. Add to `appRouter` in `src/server/api/root.ts`
4. Use protected procedures for auth checks

### Adding a Prisma model
1. Update `prisma/schema.prisma`
2. Run `pnpm db:generate` to create migration
3. Update TypeScript types in `src/domain/`
4. Add tRPC procedures for CRUD operations

### Creating a custom hook
1. Use tRPC hooks for data fetching
2. Export hook and related types
3. Document hook parameters and return value
