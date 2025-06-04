# FootBored Transition Audit

This document captures the current backend and realtime setup for FootBored as of the latest repository state and sketches how the project could map to Supabase.

## 1. Repo Inventory

- **Server files**
  - `server/main.js` – Express app wrapped with `serverless-http` for Netlify functions. Provides `/pusher/user-auth` and `/pusher/auth` routes and serves static files.
  - `server-local.js` – Starts the same Express app locally on port 3000.
  - Netlify config (`netlify.toml`) builds the serverless function via `netlify-lambda`.
- **Frameworks/Libraries**: Express, Pusher, serverless-http.
- **State storage**: Game state saved in browser `localStorage` (see `public/js/run.js` lines 1088‑1091).

## 2. Realtime Layer

- Pusher is initialized in `public/js/script.js`:
  ```js
  const pusher = new Pusher('f18497dc97d155f3f978', {
    userAuthentication: { endpoint: '/.netlify/functions/main/pusher/user-auth' },
    channelAuthorization: { endpoint: '/.netlify/functions/main/pusher/auth' },
    cluster: 'us3'
  })
  ```
  【F:public/js/script.js†L18-L26】
- Game sessions subscribe to `private-game-{gamecode}` and exchange events named `client-value` (see `public/js/run.js` lines 185‑206 and 315‑324).
- Only Pusher events currently used are `client-value`, `pusher:subscription_succeeded` and `pusher:subscription_error`.

## 3. Auth Flow

- No real auth system. `server/main.js` hardcodes a user when responding to `/pusher/user-auth`:
  ```js
  router.post('/pusher/user-auth', (req, res) => {
    const socketId = req.body.socket_id
    const user = { id: '12345', user_info: { name: 'John Smith' } }
    const authResponse = pusher.authenticateUser(socketId, user)
    res.send(authResponse)
  })
  ```
  【F:server/main.js†L18-L28】
- Aside from this placeholder, user IDs aren’t stored anywhere else in the codebase.

## 4. Data Models

- **Database**: none today (no JSON files or external DB). All game data is client-side.
- **Game object** – serialized via `Game.toJSON()` (excerpt below shows key fields):
  ```js
  this.toJSON = () => {
    return {
      gameType: this.gameType,
      numberPlayers: this.numberPlayers,
      home: this.home,
      down: this.down,
      ...
      run: JSON.stringify(this.run)
    }
  }
  ```
  【F:public/js/game.js†L135-L168】
- **User/Player object** – `Player` class tracks team, score, timeouts and stats. No persistent user model exists.

## 5. Environment & Deploy

- Secrets (`PUSHER_KEY` and `PUSHER_SECRET`) are pulled from environment variables in `server/main.js`.
- `.gitignore` ignores `.env` and `functions/`, implying secrets are managed through local `.env` files or Netlify dashboard variables.
- Deployment is via Netlify (`netlify-lambda build server`), producing serverless functions in the `functions/` folder at build time.

## 6. Migration Rough‑In to Supabase

- **Supabase Auth** – Replace the custom Pusher user-auth route with Supabase’s authentication. Store users in Supabase Auth and associate game sessions with `auth.user().id`.
- **Realtime** – Swap Pusher for Supabase Realtime channels. Subscribe to a `game:{gamecode}` channel and emit the same `client-value` payloads. Update the client to connect through Supabase’s JS client instead of Pusher.
- **Database** – Map the fields from `Game.toJSON()` and `Player.toJSON()` to Postgres tables. For example, a `games` table storing serialized state and a `players` table referencing users.
- **Serverless Functions** – Optionally keep Express for API routes or migrate logic to Supabase Functions/Edge functions. Pusher auth routes become unnecessary once realtime uses Supabase channels.
- **Environment** – Move secrets to Supabase project settings and reference via environment variables in your deployment platform. Ensure CORS rules allow your front-end.
- **CI/CD** – Update build scripts to deploy static assets and, if needed, any serverless functions to your chosen host. Netlify can still host the frontend while Supabase handles backend services.
- **Potential Unknowns** – CORS configuration for Supabase, rewriting realtime handshake logic, and handling larger binary assets (if any) are areas to watch during migration.

## Migration Checklist

1. Create Supabase project and configure Auth.
2. Design `games` and `players` tables mirroring the current `Game` and `Player` structures.
3. Replace Pusher initialization and event calls with Supabase Realtime channels.
4. Remove Netlify Pusher auth routes; set up endpoints (or Supabase Functions) for saving/loading game state.
5. Store and load game data from Postgres instead of `localStorage`.
6. Update deployment scripts to include Supabase environment variables.
7. Test realtime interactions and auth flows end-to-end.

