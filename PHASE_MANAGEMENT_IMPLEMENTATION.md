# Phase Management Implementation

## Overview

This document describes the new phase-based timer architecture for the multiplayer match system, replacing the old client-side timer logic with synchronized backend-controlled phase transitions.

## Architecture

### Backend Changes (`backend/src/matches/matches.service.ts`)

#### 1. Phase Timer Management

- Added `phaseTimers` Map to track active timers for each match
- Timers are automatically cleared and replaced when phases change

#### 2. Match Start (`startMatch`)

- Sets initial phase to `'guessing'`
- Sets `phaseEndsAt` to 45 seconds from now
- Schedules automatic phase transition when time expires

#### 3. Confirm Guess (`confirmGuess`)

- When all players submit guesses:
  - Clears existing guessing phase timer
  - Marks round as resolved
  - Sets phase to `'post_results'`
  - Sets `phaseEndsAt` to 7 seconds from now
  - Schedules post-results phase transition

#### 4. Phase Transitions (`schedulePhaseTransition`)

Centralized method that:

- Clears any existing timer for the match
- Sets a new timer based on the delay
- Handles timeout actions based on current phase

#### 5. Guessing Phase Timeout (`handleGuessingPhaseTimeout`)

When guessing time runs out:

- Submits 0-score guesses for players who didn't submit
- Marks round as resolved
- Moves to `'post_results'` phase
- Schedules next transition (7 seconds)
- Emits `'phase_changed'` event

#### 6. Post-Results Transition (`moveToNextRound`)

After 7-second post-results phase:

- If more rounds remain:
  - Increments `currentRound`
  - Sets phase to `'guessing'`
  - Sets new `phaseEndsAt` (45 seconds)
  - Schedules next guessing phase timeout
  - Emits `'round_started'` event
- If match complete:
  - Sets phase and status to `'finished'`
  - Emits `'match_finished'` event

### Frontend Changes

#### 1. Socket Hook (`frontend/src/hooks/useMatchWebSocket.ts`)

Added new event listeners:

- `phase_changed` - When backend changes phase (e.g., timeout)
- `round_started` - When new round begins
- `match_finished` - When match completes
- Removed old `finish_round` event

#### 2. MultiplayerMap Component (`frontend/src/components/MultiplayerMap.tsx`)

**Timer Logic Replaced:**

- Old: Local 45-second countdown with hardcoded delays
- New: Synchronized timer based on `roomState.phaseEndsAt`

**Key Changes:**

- Removed duplicate timer useEffect
- Timer now calculates remaining time from `phaseEndsAt` timestamp
- Timer only runs during `'guessing'` phase
- Auto-submit happens when timer reaches 0
- All phase transitions come from backend via socket events

**Socket Event Handlers:**

```typescript
const { confirmGuess } = useMatchSocket(roomState.code, {
  onGuessConfirmed,
  onPhaseChanged: onGuessConfirmed,
  onRoundStarted: onGuessConfirmed,
  onMatchFinished: onGuessConfirmed,
});
```

#### 3. MultiplayerResultCard Component (`frontend/src/components/MultiplayerResultCard.tsx`)

**Countdown Timer:**

- Now calculates from `phaseEndsAt` prop instead of hardcoded 7 seconds
- Shows accurate countdown even if user joins mid-phase
- Automatically syncs with backend timing

## Flow Diagram

```
START MATCH
  ↓
[Backend] phase = 'guessing', phaseEndsAt = now + 45s
  ↓
[Frontend] Shows timer based on phaseEndsAt
  ↓
[Players submit guesses OR timer expires]
  ↓
[Backend] phase = 'post_results', phaseEndsAt = now + 7s
  ↓
[Frontend] Shows result card with countdown
  ↓
[After 7 seconds]
  ↓
[Backend] If more rounds: phase = 'guessing', currentRound++
          Else: phase = 'finished'
  ↓
[Frontend] Reacts to phase change and updates UI
```

## Benefits

1. **Synchronized Timing**: All clients see the same countdown based on server time
2. **Automatic Transitions**: Backend handles phase changes, no client-side delays needed
3. **Resilience**: Players joining mid-round see correct remaining time
4. **Simplified Logic**: Single source of truth for phase state
5. **No Race Conditions**: Backend coordinates all transitions

## Events Summary

### Backend Emits:

- `match_started` - Initial match start with rounds data
- `guess_confirmed` - When a player submits (sent after each guess)
- `phase_changed` - When phase changes due to timeout
- `round_started` - When new round begins after post_results
- `match_finished` - When all rounds complete

### Frontend Listens:

All events update `roomState` which triggers re-renders and timer updates.

## Migration Notes

- Old `finish_round` event removed
- `confirmGuess` no longer accepts `playerId` parameter (derived from socket connection)
- Frontend no longer manages phase delays locally
- `phaseEndsAt` is now critical for timing - must be set on all phase changes
