FootBored Rebuild – Product Requirements Document (PRD)
(v1.0 ‒ June 2025)

1. Executive Summary
FootBored began as a side-by-side calculator game. We’re refactoring it into a web-first, cloud-backed product that can later power native clients (iOS/Android). Phase 1 ships a Supabase-powered MVP with account auth, persistent games, and realtime play. Subsequent phases layer in the existing game engine, UI polish, and future features (push notifications, offline mode).

2. Problem & Opportunity
Problem: Current build is 100 % client-side; games vanish on refresh and Pusher auth no longer works.

Opportunity: A single Postgres + Auth + Realtime backend (Supabase) gives us durability, cross-platform access, and no-ops hosting—perfect for an indie budget.

3. Goals & Success Metrics
Goal  KPI / Metric  Target
Durable multiplayer  Avg. game resumability after refresh  100 %
Low-latency moves  95th-pct move propagation time  ≤ 150 ms
User adoption  Unique sign-ups first 30 days  ≥ 100
Codebase health  Jest / vitest coverage on game engine  ≥ 80 %
Budget  Monthly infra cost  ≤ $25

Non-goals (v1): native apps, AI opponents, monetization.

4. Product Scope & Phasing
Phase 0 – Foundations (Dev Week 0)
Set up Supabase project, GitHub repo split (/client, /server).
Skeleton DB schema committed via migration script.
CI pipeline (GitHub → Netlify/Cloudflare Pages).

Phase 1 – MVP Backend & Thin Client (Dev Weeks 1-2)
Feature  User Story  Acceptance Criteria
Auth  "As a player, I can sign up / log in with email+password."  JWT issued; row in users; RLS on tables.
Game creation  "I can host a new game and share a code."  POST /games returns {id, code}; DB row created.
Join game  "I can enter code to join."  Member added; both clients subscribe to channel.
Make move  "I can click to make a move and my opponent sees it instantly."  Move validated client-side only; insert to game_events; < 150 ms push.
Reload persistence  "If I reload the tab, my game state re-loads."  GET /games/:id reconstructs board.
Basic UI  Minimal React/HTML; no styling polish.  Works on desktop Chrome ≥ 95.

Phase 2 – Port Existing Game Logic (Dev Weeks 3-4)
Extract calculator JS to packages/game-engine.
Server-side validation (Edge Function) for /move endpoint.
Unit tests (happy path + invalid move).
Store win/lose status; add status column to games.

Phase 3 – UI & UX Alignment (Dev Weeks 5-6)
Re-wire original canvas/DOM UI.
Responsive layout (mobile portrait first).
Basic theming (team colors).
Lobby screen (list active games user is in).

Phase 4 – Polish & Stretch (Backlog)
Animations, sound effects.
Chat & emojis.
Stats/leaderboard (player_stats view).
PWA install prompt + offline queue-then-sync.
Push notifications via Supabase Edge → FCM/APNs.
Native iOS shell using same REST/WS endpoints.

5. Data Model (Postgres)
```sql
users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

games (
  id uuid primary key default gen_random_uuid(),
  host uuid references users(id),
  status text default 'active',         -- active | finished | abandoned
  state jsonb,                          -- canonical board snapshot
  created_at timestamptz default now()
);

game_events (
  id bigserial primary key,
  game_id uuid references games(id) on delete cascade,
  actor uuid references users(id),
  evt jsonb,            -- {type:'move', data:{...}}
  created_at timestamptz default now()
);
```
Row-Level Security:
```sql
create policy "Players only"
  on game_events
  for all using ( exists (
    select 1 from games
      where id = game_id
        and (host = auth.uid() or auth.uid() = actor)
  ));
```

6. API Surface (initial)
Method & Path  Purpose  Auth  Body / Params
POST /auth/signup  Email registration  –  {email, password}
POST /auth/login  Session  –  {email, password}
POST /games  Host new game  JWT  {state?}
POST /games/:id/join  Join game by code  JWT  –
GET /games/:id  Get current state  JWT  –
POST /games/:id/move  Make move  JWT  {move}
GET /users/me/games  My active games  JWT  –

Realtime: subscribe to supabase.channel('game-'+id) for game_events.

7. UX Principles
Latency matters – visual feedback within 100 ms of click.
Session resilience – hard refresh never loses a turn.
Accessibility – color-blind palette, keyboard navigation MVP+.
N + 1 design – UI elements sized for touch from day 1.
Future-client-friendly – no business logic locked in DOM.

8. Technical Constraints & Stack
Layer  Tech  Notes
DB & Auth  Supabase (Postgres 15, GoTrue, Realtime)  $0 dev tier
Edge Functions  Supabase Edge Runtime (Deno)  Game validation
Client (web)  React + Vite  Simple state machine (XState)
State mgmt  zustand  Lightweight
Testing  Vitest + React Testing Library  Coverage target 80 %
CI/CD  GitHub Actions → Netlify preview → main
Issue tracking  GitHub Projects  Kanban per phase

9. Risks & Mitigations
Risk  Impact  Mitigation
Supabase free quota hit  Downtime / cost spike  Alert on row count > 80 % limit; plan $25/mo upgrade in advance
Realtime at scale  WS fan-out lag  Enable Broadcast extension or switch to Ably if CCU > 200
Game-engine bugs  Wrong scores  Unit + property-based tests; server-side validation
Front-end debt  Hard to port to native  Keep game engine & state machine platform-agnostic

10. Milestones & Timeline (aggressive)
Week  Deliverable
0  Supabase project, repo split, CI pipeline green
1  Auth + games CRUD live in dev
2  MVP realtime move flow demoable
3  Game engine ported, server validation
4  Internal alpha (playable, ugly)
5  Responsive UI pass, lobby screen
6  Public beta (Netlify URL)
7+  Polish backlog, analytics, stretch goals

11. Analytics & Telemetry (post-beta)
Log game duration, abandonment rate.
Track move latency perc95.
Opt-in error reporting (Sentry).

12. Open Questions
What calculator-era edge-cases must remain identical for nostalgia?
Will chat be moderated or free-for-all?
Do we need GDPR/CCPA readiness before public beta?

Next Steps
Review & sign-off on this PRD.
Once approved, create Phase 0 tasks in GitHub Projects and book a 30-minute kickoff to assign owners and dates.

— End of PRD
