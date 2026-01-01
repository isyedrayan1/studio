# Tournament Mechanics & Rules

## Overview
Arena Ace tournament system for Free Fire BR with 3-day format supporting different game modes.

---

## Day 1: BR Shortlisting (18 Teams → Top 12 Qualify)

### Format
- **18 teams** divided into 3 groups (A, B, C) of 6 teams each
- **3 matches**: AB, BC, AC (each team plays 2 matches)
- **Qualification**: Top 12 teams by total points advance to Day 2

### Scoring
- **Kill Points**: 1 point per kill
- **Placement Points**: 
  - 1st = 12pts, 2nd = 9pts, 3rd = 8pts, 4th = 7pts
  - 5th = 6pts, 6th = 5pts, 7th = 4pts, 8th = 3pts
  - 9th = 2pts, 10th = 1pt, 11th-12th = 0pts
- **Total** = Kills + Placement Points
- **Booyah Tracking**: Winner (1st place) is tracked
- **NO Champion Rush badges on Day 1** - Basic scoring only

### What Admins/Associates Update
- **Match Status**: Admin sets match to "Live" when starting
- **Scores**: Admin OR Associate enters:
  - Kills (number)
  - Placement (1-12)
- **Auto-Calculated**:
  - Booyah flag (if placement = 1)
  - Total points
- **NOT CALCULATED on Day 1**: Champion Rush badges

---

## Day 2: BR Championship (12 Teams → Top 8 Qualify)

### Format
- **12 qualified teams** from Day 1
- **Multiple matches** (Champion Rush format)
- **Qualification**: Top 8 teams advance to Day 3

### Special Mechanics
- **Booyah**: Getting 1st place (Winner Winner Chicken Dinner)
  - Automatically tracked when placement = 1
  - Displayed in leaderboard with 🏆 icon
  
- **Champion Rush Badge** (🔥 CR): Earned by getting 8+ kills in a single match
  - Automatically awarded when kills ≥ 8
  - Displayed in leaderboard
  - Shows aggressive gameplay capability
  - Multiple badges possible (one per high-kill match)

### Scoring (Same as Day 1)
- Kill Points: 1 per kill
- Placement Points: Same structure
- **Plus**: Booyah and Champion Rush tracking for Day 2 ONLY

### What Admins/Associates Update
Same as Day 1 - just enter kills and placement, system auto-calculates:
- ✅ Booyah if placement = 1 (all days)
- ✅ Champion Rush if kills ≥ 8 (Day 2 ONLY)

---

## Day 3: CS Ranked Bracket (8 Teams → 1 Champion)

### Format
- **8 qualified teams** from Day 2
- **Knockout bracket** (Single Elimination or Double Elimination)
- **Result**: 1 Champion

### Scoring
- Bracket progression only
- No kill/placement scoring in elimination format

---

## Leaderboard Display

### Columns
1. **Rank** - Position with medals (🥇🥈🥉)
2. **Team** - Team name and tag
3. **Matches** - Number of matches played
4. **Kills** - Total kills across all matches
5. **Booyahs** - Number of 1st place finishes (🏆) - All days
6. **🔥 CR** - Champion Rush badge count (8+ kill matches) - Day 2 only
7. **Placement Pts** - Total placement points
8. **Total Points** - Overall score (determines ranking)

### Display Logic
- **Day 1 Leaderboard**: Shows Kills, Booyahs, Placement, Total - NO Champion Rush column
- **Day 2 Leaderboard**: Shows all columns including Champion Rush
- **All Days**: Shows all columns including Champion Rush

### Filters
- **All Days**: Overall tournament standings
- **Day 1**: Shortlisting round standings
- **Day 2**: Championship round standings
- **Day 3**: Bracket view (different format)

---

## Score Entry Workflow

### Admin Score Entry (`/admin/scores`)
1. Select Day (dropdown)
2. Select Match (dropdown)
3. Enter for ALL teams:
   - Kills (number input)
   - Placement (1-12)
4. Click "Save Scores" button
5. Can "Lock Match" to prevent further edits

### Associate Score Entry (`/associate/scores`)
1. Auto-selects active day and live match
2. Enter for THEIR TEAM ONLY:
   - Kills (number input)
   - Placement (1-12)
3. Click "Submit Score" button
4. Cannot edit if match is locked by admin

### Validation Rules
- ✅ Day must be "Active" status
- ✅ Match must be "Live" status
- ✅ Match must NOT be locked
- ❌ Associates cannot edit locked matches
- ✅ Admins can edit anytime (override rules)

---

## Auto-Calculated Fields

### On Every Score Entry:
```javascript
isBooyah = (placement === 1)  // All days
hasChampionRush = (dayType === 'br-championship' && kills >= 8)  // Day 2 only
totalPoints = (kills * 1) + PLACEMENT_POINTS[placement - 1]
```

### What Users Enter:
- Kills: 0-99
- Placement: 1-12

### What System Calculates:
- Booyah flag
- Champion Rush badge
- Total points
- Leaderboard rankings
- Qualification status

---

## Match Lock System

### Purpose
Prevent changes after match is finalized

### How It Works
- Admin clicks "Lock Match" button
- Match status: `locked: true`
- ALL users (admin + associates) cannot edit scores
- Admin must "Unlock Match" to allow changes

### Use Cases
- Match is over and scores are verified
- Prevent accidental changes
- Freeze scores for review
- Official score submission

---

## Database Structure

### Score Document
```typescript
{
  id: "match1_team1",
  matchId: "match1",
  teamId: "team1",
  kills: 8,                    // User enters
  placement: 2,                // User enters
  isBooyah: false,             // Auto: placement === 1
  hasChampionRush: true,       // Auto: kills >= 8
  totalPoints: 17,             // Auto: 8 + 9 = 17
  locked: false,               // Match-level lock
  lastUpdatedBy: "admin123",
  lastUpdatedAt: "2026-01-01T10:30:00Z"
}
```

---

## Role-Based Access

### Admin Can:
- ✅ Create/edit/delete teams, days, matches
- ✅ Enter scores for ALL teams
- ✅ Lock/unlock matches
- ✅ View leaderboard
- ✅ Manage associates
- ✅ Override all restrictions

### Associate Can:
- ✅ Enter scores for THEIR TEAM only
- ✅ View their matches
- ❌ Cannot edit locked matches
- ❌ Cannot see other teams' score entry
- ❌ Cannot manage tournament structure

---

## Champion Rush Badge Threshold

**Current Setting**: 8 kills = Champion Rush badge

To change, edit in `src/lib/firebase/scores.ts`:
```typescript
const CHAMPION_RUSH_THRESHOLD = 8; // Change this number
```

Recommended values:
- **6 kills**: More teams earn badges (easier)
- **8 kills**: Balanced (current)
- **10 kills**: Elite performance only (harder)

---

## Summary: What Each Role Updates

| Field | Admin Updates | Associate Updates | Auto-Calculated |
|-------|--------------|-------------------|-----------------|
| Kills | ✅ | ✅ | ❌ |
| Placement | ✅ | ✅ | ❌ |
| Booyah | ❌ | ❌ | ✅ (placement = 1) |
| Champion Rush | ❌ | ❌ | ✅ (kills ≥ 8) |
| Total Points | ❌ | ❌ | ✅ (kills + placement) |
| Match Lock | ✅ | ❌ | ❌ |
| Day Status | ✅ | ❌ | ❌ |
| Match Status | ✅ | ❌ | ❌ |

---

## Quick Reference

### To Start a Match:
1. Admin: Set Day status to "Active"
2. Admin: Set Match status to "Live"
3. Scores can now be entered

### To End a Match:
1. All scores entered and verified
2. Admin: Click "Lock Match"
3. Scores frozen, no more edits

### To View Results:
1. Go to Leaderboard
2. Filter by day
3. See rankings with Booyahs and Champion Rush badges
