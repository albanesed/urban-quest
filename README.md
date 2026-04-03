# Urban Quest

Outdoor urban escape rooms as a service. Players walk around a city solving puzzles tied to local history, operators set up the games through a dashboard.

I started this because I thought escape rooms would work really well outdoors — you're already in an interesting city, why not make it the game? The pilot game is in Novara, where I live.

## How it works

Operators create a game with stages on a map. Each stage has GPS coordinates, a QR code printed on-site, and a puzzle. Players walk there, scan the QR, answer the puzzle, and move on. Score = correct answers minus hint penalties, no time pressure (people should enjoy the walk, not stress about it).

Leaderboard tracks the best teams per game.

## Tech stack

Turborepo monorepo, two Next.js 14 apps (player PWA + admin dashboard), Supabase for everything on the backend (Postgres, Auth, Edge Functions, Storage). Maps are Leaflet with OpenStreetMap tiles.

Edge functions are Deno — `verify-qr`, `check-answer`, `start-session`, etc. Answers are bcrypt-hashed in the database so nobody can just read them from the API.

Players don't need an account — the app uses Supabase Anonymous Auth behind the scenes. They get a random Italian name like "Falco Notturno" which they can change before starting.

## Project structure

```
apps/player/       → the PWA (port 3000)
apps/admin/        → operator dashboard (port 3001)
packages/shared/   → shared TS types
supabase/          → migrations, edge functions, seed data
```

## Setup

You need Node >= 20, npm, and the Supabase CLI. And a Supabase project (free tier is fine).

```bash
git clone https://github.com/albanesed/urban-quest.git
cd urban-quest
npm install
```

Link your Supabase project (grab the ref from Settings → General):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Create `.env.local` in the root with your Supabase URL and anon key (both in Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Symlink the env to both apps because Next.js needs it at build time:

```bash
ln -s ../../.env.local apps/player/.env.local
ln -s ../../.env.local apps/admin/.env.local
```

Push the migrations:

```bash
npx supabase db push
```

Before running the seed you need to edit `supabase/seed.sql` — replace `YOUR_AUTH_USER_ID` and `YOUR_EMAIL` with your actual values. Kind of annoying, I should probably automate this at some point.

Enable Anonymous Sign-ins in the Supabase dashboard (Authentication → Providers → scroll way down).

Deploy the edge functions:

```bash
npx supabase functions deploy start-session
npx supabase functions deploy verify-qr
npx supabase functions deploy check-answer
npx supabase functions deploy join-session
npx supabase functions deploy complete-game
npx supabase functions deploy generate-qr-codes
```

Then create an operator record for yourself — either through the seed SQL or manually:

```sql
INSERT INTO operators (auth_user_id, name, slug, email, plan)
VALUES ('your-auth-uid', 'Your Name', 'your-slug', 'you@email.com', 'pro');
```

Run it:

```bash
npm run dev
```

Player app at localhost:3000, admin at localhost:3001.

## Dev commands

```bash
npm run dev                              # both apps
npx turbo dev --filter=@urban-quest/player   # just the player
npx turbo dev --filter=@urban-quest/admin    # just the admin
npm run build                            # build everything
npm run typecheck                        # type check
npx supabase functions serve             # edge functions locally
```

To regenerate TypeScript types from the DB schema:
```bash
npx supabase gen types typescript --linked > packages/shared/src/database.types.ts
```

## The Novara game

The seed includes "Il Codice del Biscione" — six stages through Novara's center:

1. Barriera Albertina (1849 battle site)
2. Duomo e Battistero (5th century)
3. Broletto (medieval civic complex)
4. Cupola dell'Antonelli (121m, tallest brick dome in Italy)
5. Piazza Martiri + Teatro Coccia
6. Castello Visconteo-Sforzesco

About 3.5 km total, 2-2.5 hours with the puzzles. The GPS coordinates are approximate — I need to walk the route and fine-tune them, and obviously print and place the QR codes.

## What's missing

No payments (games are free for now), no tests (yeah...), and the puzzle editor in the admin stores answers as plaintext instead of hashing them — the seed data has proper bcrypt hashes but the admin UI doesn't hash yet. Need to add a small edge function or DB function for that.

The PWA works offline for navigation (map + cached tiles) but you need a connection to scan QR codes and submit answers. There's a banner that tells you when you're offline.

Haven't tested on Windows. Should work but no promises.

## License

MIT
