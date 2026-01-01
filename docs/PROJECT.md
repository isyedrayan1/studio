# Arena Ace - Project Documentation

## Overview
**Arena Ace** is a Next.js 16 esports tournament management application built for Free Fire events. It features a public-facing tournament display and an admin panel for managing teams, matches, and scores in real-time.

**Tech Stack:**
- **Framework:** Next.js 16 with Turbopack
- **Database:** Firebase Firestore (real-time)
- **Auth:** Firebase Authentication
- **Styling:** Tailwind CSS + shadcn/ui components
- **Font:** Bebas Neue (bold esports aesthetic)
- **Colors:** Primary `#FF4646` (fiery red), Accent `#29ABE2` (electric blue), Background `#333333`

---

## Tournament Structure

**FREE FIRE STUDENTS ASSOCIATION LEAGUE** runs over **3 days**:

### **Day 1 - Round Robin (br-shortlist)**
📅 Date: 02/01/2026  
📊 Total Teams: **18 teams** divided into **3 groups** (A, B, C - 6 teams each)

**Matches:**
- **Match 1:** Group A 🆚 Group B (12 teams)
- **Match 2:** Group B 🆚 Group C (12 teams)
- **Match 3:** Group A 🆚 Group C (12 teams)

➡️ **Each team plays 2 BR matches**

**Scoring:**
- Placement Points + Kill Points
- 1 Kill = 1 Point
- Scores from both matches are added

**Qualification:**
- Teams ranked by total score
- **Top 12 teams qualify to Day 2**

---

### **Day 2 - Championship (br-championship)**
📊 **Top 12 qualified teams** from Day 1 (no groups, all play together)

**Matches:**
- All 12 teams compete in BR matches
- Multiple matches possible
- Points accumulate across all matches

**Qualification:**
- **Top 8 teams qualify to Day 3**

---

### **Day 3 - Finals (cs-bracket)**
🏆 **Top 8 qualified teams** from Day 2

**Format:**
- Clash Squad - 8-team knockout bracket
- Quarterfinals → Semifinals → Finals
- Single elimination
- **1 Champion**

---

## Public Pages (Client-Facing)

### `/` - Home Page
Premium landing page with:
- **Hero section** with animated gradients and live match badge
- **Live stats bar** (teams, matches played, total kills, current stage)
- **Current Leaders** - Top 3 teams with gold/silver/bronze styling
- **Tournament Stages** - Progress cards for each day
- **Quick link** to Schedule

### `/tournament` - Tournament Hub ⭐
The main tournament page with **day tabs**:
- Switch between Day 1, Day 2, Day 3
- **For BR days (Day 1 & 2):**
  - Overall day standings (leaderboard)
  - Per-match results (select from dropdown)
  - Kill counts, placement, total points
  - Qualification status badges
- **For CS Bracket day (Day 3):**
  - Full bracket visualization
  - Quarterfinals → Semifinals → Finals
  - Live match indicators
  - Champion banner when winner is decided

### `/schedule` - Match Schedule
Shows all matches organized by day:
- Match cards with status (Upcoming/Live/Finished)
- Team counts per match
- Live match pulse animation

### `/login` - Login Page
Authentication for admins and associates:
- Email/password login
- **New users auto-register as associates**
- Redirects based on role:
  - Admin → `/admin/dashboard`
  - Associate → `/associate/scores`

---

## Admin Pages (`/admin/*`)

**Access:** Admin role only. Associates are redirected away.

| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | Overview and quick actions |
| `/admin/teams` | Add/edit/delete teams (name, tag, captain) |
| `/admin/days` | Create tournament days (set type, qualify count) |
| `/admin/groups` | Create groups for Day 1 (assign teams to groups) |
| `/admin/matches` | Create matches (assign groups/teams to matches) |
| `/admin/scores` | Enter kills and placement for each team per match |
| `/admin/bracket` | Initialize and manage Day 3 knockout bracket |
| `/admin/announcements` | Post public announcements |

---

## Associate Pages (`/associate/*`)

**Access:** Associate role only. Simplified interface for score entry.

| Route | Purpose |
|-------|---------|
| `/associate/scores` | Enter match scores (kills, placement). Same functionality as admin scores page but with simpler UI. |

---

## Key Files & Architecture

### Contexts (Global State)
```
src/contexts/
├── tournament-context.tsx   # All tournament data with real-time Firebase subscriptions
├── auth-context.tsx         # Authentication state and role checks
└── index.ts                 # Re-exports
```

**Usage:**
```tsx
const { teams, matches, scores, addTeam, setScore } = useTournament();
const { isAdmin, isAssociate, canEdit, signIn, signOut } = useAuth();
```

### Firebase Services
```
src/lib/firebase/
├── config.ts          # Firebase initialization
├── collections.ts     # Collection name constants
├── teams.ts           # Team CRUD + subscribe
├── days.ts            # Day CRUD + subscribe
├── groups.ts          # Group CRUD + subscribe
├── matches.ts         # Match CRUD + subscribe
├── scores.ts          # Score CRUD + subscribe
├── bracket-matches.ts # Bracket CRUD + winner advancement
├── announcements.ts   # Announcement CRUD + subscribe
├── auth.ts            # Sign in/out + user profiles
└── index.ts           # Re-exports everything
```

### Types
All TypeScript types in `src/lib/types.ts`:
- `Team`, `Day`, `Group`, `Match`, `Score`, `BracketMatch`, `Announcement`, `User`
- `DayType`: `'br-shortlist' | 'br-championship' | 'cs-bracket'`
- `LeaderboardEntry` for calculated rankings

### Components
```
src/components/
├── admin/              # Admin-specific components
│   └── admin-sidebar.tsx
├── public/             # Public page components
│   ├── public-sidebar.tsx
│   ├── leaderboard-table.tsx
│   └── announcement-banner.tsx
├── layout/             # Shared layout
│   ├── header.tsx
│   └── footer.tsx
├── icons/              # Custom icons
│   └── logo.tsx
└── ui/                 # shadcn/ui primitives (DO NOT MODIFY)
```

---

## User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Admin** | Full access | Can manage teams, days, groups, matches, scores, bracket, announcements |
| **Associate** | Score entry only | Can only enter/update match scores |

### How roles work:
1. User signs up → automatically becomes **Associate**
2. Admin must manually change role to `admin` in Firestore (`users` collection)
3. Routes are protected in layout files:
   - `src/app/admin/layout.tsx` - redirects non-admins
   - `src/app/associate/layout.tsx` - redirects non-associates

---

## Points System

| Action | Points |
|--------|--------|
| Kill | 1 point |
| 1st place | 12 points |
| 2nd place | 9 points |
| 3rd place | 8 points |
| 4th place | 7 points |
| 5th place | 6 points |
| 6th place | 5 points |
| 7th place | 4 points |
| 8th place | 3 points |
| 9th place | 2 points |
| 10th place | 1 point |
| 11th-12th place | 0 points |

**Formula:** `Total Points = Kills × 1 + Placement Points`

---

## Commands

```bash
npm run dev          # Start dev server (port 9002)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
```

---

## Environment Variables

Create `.env.local` with Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `teams` | All participating teams |
| `days` | Tournament days (Day 1, 2, 3) |
| `groups` | Team groupings for Day 1 |
| `matches` | BR matches with team assignments |
| `scores` | Match scores (kills, placement per team) |
| `bracketMatches` | Day 3 knockout bracket matches |
| `announcements` | Public announcements |
| `users` | User profiles with roles |

---

## Workflow: Running a Tournament

### Setup Phase (Admin) - **Before Event Day**

1. **Create Days** - Go to `/admin/days`
   - Create Day 1 (br-shortlist, qualify: 12)
   - Create Day 2 (br-championship, qualify: 8)
   - Create Day 3 (cs-bracket, qualify: 1)

2. **Add Teams** - Go to `/admin/teams`
   - Add all 18 teams with names, tags, captain info

3. **Create Groups** - Go to `/admin/groups` (Day 1 ONLY)
   - Create Group A (select 6 teams)
   - Create Group B (select 6 teams)
   - Create Group C (select 6 teams)

4. **Create Day 1 Matches** - Go to `/admin/matches`
   - Match 1: Select Day 1 → Check Group A + Group B
   - Match 2: Select Day 1 → Check Group B + Group C
   - Match 3: Select Day 1 → Check Group A + Group C

---

### Day 1 - Live Event

1. **Start Day 1** - Go to `/admin/days` → Click "Start Day" for Day 1
2. **Start Match 1** - Go to `/admin/matches` → Set Match 1 to "Live"
3. **Enter Scores** - Go to `/admin/scores` or `/associate/scores`
   - Select Day 1 → Select Match 1
   - Enter kills and placement for all 12 teams
   - Click "Save Scores"
4. **Repeat for Match 2 and Match 3**
5. **End Day 1** - Go to `/admin/days` → Click "End Day" for Day 1
   - ✨ **Automatically creates Day 2 match with top 12 teams!**

---

### Day 2 - Live Event

1. **Start Day 2** - Go to `/admin/days` → Click "Start Day" for Day 2
2. **Match already created** - Top 12 from Day 1 automatically assigned
3. **Start Match** - Go to `/admin/matches` → Set match to "Live"
4. **Enter Scores** - Same process as Day 1
5. **End Day 2** - Top 8 teams qualify for bracket

---

### Day 3 - Bracket Finals

1. **Initialize Bracket** - Go to `/admin/bracket`
   - Top 8 teams from Day 2 automatically populate
   - Click "Initialize Bracket"
2. **Set Winners** - As matches complete, select winners
   - Winners automatically advance to next round
3. **Champion Crowned** - Finals winner becomes tournament champion

---

### Public Viewing (Real-Time)

- Spectators visit `/tournament` to see live standings
- Leaderboards update automatically as scores are entered
- Day 3 shows bracket with live match indicators
- Home page shows top 3 teams and live stats

---

## Key Features

### ✅ Status-Based Score Entry
- Scores can only be entered when:
  - Day status = "Active"
  - Match status = "Live"
- Prevents accidental edits to completed matches

### ✅ Auto-Qualification
- Day 1 → Day 2: When Day 1 ends, automatically creates Day 2 match with top 12 teams
- Day 2 → Day 3: Top 8 teams automatically qualify for bracket

### ✅ Real-Time Updates
- All public pages update instantly when scores are entered
- No page refresh needed

### ✅ Role-Based Access
- **Admin:** Full tournament management
- **Associate:** Score entry only (simplified interface)

---

## Recent Changes Summary

1. **Role-based authentication** - Admins get full access, associates can only enter scores
2. **Auto-registration** - New users automatically become associates
3. **Premium landing page** - Hero, live stats, top teams, stage progress
4. **Tournament hub** - Unified page with day tabs for all leaderboards and bracket
5. **Simplified navigation** - Home → Tournament → Schedule
6. **Integrated bracket view** - Bracket shows inline in Tournament page for Day 3

---

## Need Help?

- **Types:** Check `src/lib/types.ts`
- **Firebase functions:** Check `src/lib/firebase/*.ts`
- **Context usage:** Check `src/contexts/*.tsx`
- **UI components:** Check `src/components/ui/` (shadcn/ui docs: https://ui.shadcn.com)
