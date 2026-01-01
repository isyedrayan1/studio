# Arena Ace - Copilot Instructions

## Project Overview
A Next.js 16 esports tournament management app for Free Fire events. Uses Firebase (Firestore + Auth), Tailwind CSS, and shadcn/ui components. Admin panel manages teams, matches, scores; public pages display live leaderboards.

## Architecture

### Core Data Flow
```
Firebase Firestore ← TournamentContext (real-time subscriptions) → Components
                   ← AuthContext (auth state) →
```

- **TournamentContext** ([src/contexts/tournament-context.tsx](src/contexts/tournament-context.tsx)): Central state for all tournament data with real-time Firebase subscriptions. Use `useTournament()` hook - never call Firebase directly from components.
- **AuthContext** ([src/contexts/auth-context.tsx](src/contexts/auth-context.tsx)): Auth state with role-based access (`isAdmin`, `canEdit`, `canDelete`).

### Firebase Service Layer
All Firebase operations in `src/lib/firebase/`:
- One file per entity (`teams.ts`, `matches.ts`, `scores.ts`, etc.)
- Pattern: `getX`, `addX`, `updateX`, `deleteX`, `subscribeToX`
- Collections defined in [src/lib/firebase/collections.ts](src/lib/firebase/collections.ts)
- Re-exported through [src/lib/firebase/index.ts](src/lib/firebase/index.ts)

### Type System
All types in [src/lib/types.ts](src/lib/types.ts). Key entities:
- `Team`, `Day`, `Group`, `Match`, `Score`, `BracketMatch`, `Announcement`
- Day types: `br-shortlist` (Day 1), `br-championship` (Day 2), `cs-bracket` (Day 3)
- `LeaderboardEntry` for calculated rankings

## Key Conventions

### Component Structure
- **Admin pages**: `src/app/admin/[feature]/page.tsx` - use `"use client"` directive
- **Public pages**: `src/app/[feature]/page.tsx`
- **UI components**: `src/components/ui/` - shadcn/ui primitives (do not modify)
- **Feature components**: `src/components/admin/` and `src/components/public/`

### State Pattern for Admin Pages
```tsx
"use client";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { teams, addTeam, loading, error } = useTournament();
  const { toast } = useToast();
  // Dialog states: isAddOpen, isEditOpen, isDeleteOpen
  // Form states for controlled inputs
  // Filter states for data views
}
```

### Toast Notifications
Use `useToast()` hook for user feedback:
```tsx
toast({ title: "Success", description: "Team added" });
toast({ title: "Error", description: error.message, variant: "destructive" });
```

### Styling
- Dark theme only (class `dark` on `<html>`)
- Font: Bebas Neue (condensed, bold aesthetic)
- Colors: Primary `#FF4646` (fiery red), Accent `#29ABE2` (electric blue), Background `#333333`
- Use `cn()` from `@/lib/utils` for conditional classes

## Commands
```bash
npm run dev          # Dev server with Turbopack on port 9002
npm run build        # Production build
npm run typecheck    # TypeScript validation
```

## Role-Based Access

### User Roles
- **Admin** (`role: 'admin'`): Full access to all admin features (teams, days, groups, matches, scores, announcements, bracket)
- **Associate** (`role: 'associate'`): Score entry only - dedicated simplified interface

### Route Protection
- `/admin/*` routes: Admin-only, protected in [src/app/admin/layout.tsx](src/app/admin/layout.tsx)
- `/associate/*` routes: Associate-only, protected in [src/app/associate/layout.tsx](src/app/associate/layout.tsx)
- Login redirects based on role: admin → `/admin/dashboard`, associate → `/associate/scores`

### Auth Context Usage
```tsx
const { isAdmin, isAssociate, canEdit, canDelete } = useAuth();
// canEdit = admin OR associate (for score updates)
// canDelete = admin only
```

## Common Patterns

### Adding a New Firebase Entity
1. Add type to `src/lib/types.ts`
2. Add collection name to `src/lib/firebase/collections.ts`
3. Create `src/lib/firebase/[entity].ts` with CRUD + subscribe functions
4. Export from `src/lib/firebase/index.ts`
5. Add to `TournamentContext`: state, subscribe, action methods

### Leaderboard Calculation
Use `calculateLeaderboard()` from [src/lib/utils-tournament.ts](src/lib/utils-tournament.ts) - handles kill points, placement points, sorting, and qualification logic.

## Environment
Firebase config via `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
