# DutyLookup DB2

Fullstack starter for a Dublin Bus DB2 duty lookup app using React/Vite and Supabase.

## What works now

- Futuristic driver search UI.
- Search by roster number.
- Day selector: Monday–Friday, Saturday, Sunday.
- DZ4 resolver rules:
  - `DZ4/23 -> duty 23`
  - `DZ4/2X -> duty 202`
  - `DZ4/26X -> duty 226`
- Demo duty card for `DZ4/23` weekday.
- Driver exchange section: take over / hand over duty numbers, time, location.
- Supabase schema and demo seed.
- Netlify SPA redirect fix.
- Importer/parser scaffolding for new Dublin Bus duty-book releases.

## Windows CMD setup

Make sure Node and npm are installed:

```cmd
node -v
npm -v
```

Then run:

```cmd
cd Downloads
cd dutylookup-db2
copy .env.example .env
npm install
npm run dev
```

Open the local URL shown in CMD, usually:

```text
http://localhost:5173
```

## Supabase setup

Your project URL:

```text
https://usdjcifblrsqkvbkrbdq.supabase.co
```

Create `.env`:

```env
VITE_SUPABASE_URL=https://usdjcifblrsqkvbkrbdq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_d6gXIe6y5bB5mWPGRR9JsQ_fApN2p1S
```

In Supabase SQL Editor, run:

1. `supabase/schema.sql`
2. `supabase/demo_seed.sql`

Restart the app:

```cmd
npm run dev
```

## Test searches

Use:

```text
DZ4/23
Monday–Friday
```

Also try:

```text
DZ4/2X
Monday–Friday
```

`DZ4/2X` shows the resolver rule converting it to duty `202`.

## Future importer workflow

When Dublin Bus releases a new bill:

1. Admin uploads new Excel/CAP files.
2. Importer creates a new `duty_books` version.
3. Parser extracts rosters, duties, timing points, breaks, takeovers, handovers.
4. You verify the new version.
5. Mark it active.

The app code does not need rebuilding for new bills.
