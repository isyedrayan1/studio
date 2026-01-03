# Admin Controls Summary - Full Access Features

## 🎯 Overview
This document explains the enhanced admin controls that give you **full access** to manage days and scores, even after they've been completed or locked.

---

## 📅 Day Management - Restart Day Feature

### What Changed
Previously, once a day was marked as "completed", you could only lock it. Now you can **restart** a completed day to make it active again.

### How It Works

#### Day Status Flow
```
upcoming → active (Start Day)
    ↓
active → paused (Pause)
    ↓
paused → active (Resume)
    ↓
active → completed (End Day)
    ↓
completed → active (Restart Day) ← NEW! ✨
    OR
completed → locked (Lock Results)
```

#### What Happens When You Restart a Day
1. **Status changes**: `completed` → `active`
2. **endTime is cleared**: The timestamp is removed from Firebase
3. **Everything else stays intact**:
   - ✅ All matches remain
   - ✅ All scores remain
   - ✅ All groups remain
   - ✅ All team assignments remain

### Use Cases
- **Accidentally ended a day early** - Just restart it!
- **Want to add more matches** - Restart, add matches, then end again
- **Extend tournament day** - Need more time? Restart and continue
- **Fix scoring issues** - Restart, correct scores, then end properly

### Location
**Admin Panel → Day Management** (`/admin/days`)

### Database Connection
- **Function**: `updateDay()` in `src/lib/firebase/days.ts`
- **Updates**: Firestore `days` collection
- **Fields modified**: `status`, `endTime` (deleted using `deleteField()`)

---

## 🏆 Score Management - Unlock Match Feature

### What Changed
Previously, you could only edit scores if:
- Day status was "active" AND
- Match status was "live" AND
- Match was not locked

Now you can edit scores **anytime** as long as the match is unlocked, regardless of day or match status.

### How It Works

#### New Editing Logic
```typescript
// OLD (restrictive)
canEdit = day.status === "active" && match.status === "live" && !match.locked

// NEW (flexible)
canEdit = !match.locked
```

#### Match Lock/Unlock Flow
1. **Any match can be locked** - Prevents editing
2. **Any match can be unlocked** - Allows editing
3. **Lock status is independent** of day/match status

#### What the Buttons Do

**Lock Match Button** (when unlocked):
- Sets `match.locked = true` in Firebase
- Disables all score input fields
- Shows "Locked - Read-only" status

**Unlock Match Button** (when locked):
- Sets `match.locked = false` in Firebase
- Enables all score input fields
- Shows "Unlocked - Editable" status

### Use Cases
- **Fix wrong scores** - Unlock the match, edit, save, lock again
- **Update scores after day ended** - Unlock match, make changes
- **Correct data entry errors** - Full admin access anytime
- **Adjust scores for disputes** - Unlock, fix, lock

### Location
**Admin Panel → Score Management** (`/admin/scores`)

### Database Connection
- **Function**: `toggleMatchLock()` in `src/lib/firebase/matches.ts`
- **Updates**: Firestore `matches` collection
- **Field modified**: `locked` (boolean)

---

## 🔥 Firebase Database Connections

### All Changes Are Real-Time Synced

#### Day Updates
```typescript
// File: src/lib/firebase/days.ts
export async function updateDay(id: string, data: Partial<Day>): Promise<void> {
  const processedData = processUpdateData(data);
  const docRef = doc(db, COLLECTIONS.DAYS, id);
  await updateDoc(docRef, processedData);
}
```

**Special Handling for Restart Day**:
- When `endTime: undefined` is passed, it uses `deleteField()` to remove the field from Firestore
- This ensures the timestamp is completely cleared, not just set to null

#### Match Lock Updates
```typescript
// File: src/lib/firebase/matches.ts
export async function toggleMatchLock(matchId: string, currentLocked: boolean): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
  await updateDoc(docRef, { locked: !currentLocked });
}
```

#### Score Updates
```typescript
// File: src/lib/firebase/scores.ts
export async function setScore(
  matchId: string,
  teamId: string,
  kills: number,
  placement: number,
  userId: string,
  dayType?: DayType
): Promise<void> {
  // Updates or creates score document in Firestore
  // Calculates totalPoints, isBooyah, hasChampionRush
  // Stores lastUpdatedBy and lastUpdatedAt
}
```

### Real-Time Listeners
All data uses Firebase's `onSnapshot` for real-time updates:
- Changes appear instantly across all connected clients
- No page refresh needed
- Tournament context automatically updates

---

## 🎮 How to Use These Features

### Restarting a Completed Day

1. Go to **Admin Panel → Day Management**
2. Find the day with status "Completed"
3. Click the **green "Restart Day"** button
4. The day becomes active again
5. You can now:
   - Add more matches
   - Edit existing scores (if matches are unlocked)
   - Continue the tournament
6. When done, click **"End Day"** again

### Unlocking a Match to Edit Scores

1. Go to **Admin Panel → Score Management**
2. Select the day and match
3. If match shows "Locked - Read-only":
   - Click the **red "Unlock Match"** button
4. Input fields become editable
5. Make your changes
6. Click **"Save Scores"**
7. Click **"Lock Match"** to prevent further edits

---

## 🛡️ Best Practices

### Day Management
- ✅ **DO** restart a day if you need to add more matches
- ✅ **DO** restart if you ended a day by mistake
- ⚠️ **BE CAREFUL** when restarting - make sure it's intentional
- 🔒 **LOCK** the day when truly finished to prevent accidents

### Score Management
- ✅ **DO** unlock matches to fix errors
- ✅ **DO** lock matches after scores are verified
- ⚠️ **COMMUNICATE** with your team when unlocking matches
- 🔒 **LOCK** matches after final verification

---

## 📊 Data Integrity

### What's Preserved
All these features maintain complete data integrity:
- ✅ No scores are deleted
- ✅ No matches are removed
- ✅ No teams are affected
- ✅ Leaderboard calculations remain accurate
- ✅ Audit trail is maintained (lastUpdatedBy, lastUpdatedAt)

### What Changes
Only the specific fields you're modifying:
- **Restart Day**: `status`, `endTime`
- **Lock/Unlock Match**: `locked`
- **Edit Scores**: `kills`, `placement`, `totalPoints`, `lastUpdatedBy`, `lastUpdatedAt`

---

## 🚀 Technical Details

### Files Modified

1. **src/app/admin/days/page.tsx**
   - Added "Restart Day" button for completed days
   - Updated `handleStatusChange` to clear `endTime` when restarting

2. **src/app/admin/scores/page.tsx**
   - Changed `canEdit` logic to only check match lock status
   - Removed day/match status restrictions for admins
   - Updated UI text for clarity

3. **src/lib/firebase/days.ts**
   - Added `deleteField` import
   - Created `processUpdateData()` helper
   - Updated `updateDay()` to handle field deletion

### Database Schema Impact
No schema changes required - all features use existing fields:
- `days.status` (existing)
- `days.endTime` (existing, now can be deleted)
- `matches.locked` (existing)

---

## ✅ Testing Checklist

- [x] Restart Day button appears on completed days
- [x] Restart Day changes status to active
- [x] Restart Day clears endTime in Firebase
- [x] All matches/scores remain intact after restart
- [x] Unlock Match button works on any match
- [x] Scores can be edited when match is unlocked
- [x] Scores cannot be edited when match is locked
- [x] Lock/Unlock updates Firebase in real-time
- [x] All changes sync across multiple clients

---

**Last Updated**: 2026-01-03
**Version**: 1.0
