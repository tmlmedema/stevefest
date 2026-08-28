# STEVE FEST II — WEBSITE

Shannon's Deli · 11 S Park Ave, Lombard, IL 60148 · Sept 11–13, 2026

A [Next.js](https://nextjs.org) site. The old single-file version is kept in
`legacy/` for reference.

## Running it

You need [Node.js](https://nodejs.org) installed. Once, to fetch the packages:

```bash
npm install
```

Then, to work on the site:

```bash
npm run dev
```

Open http://localhost:3000. Edits show up in the browser as you save.

## The pages

| URL         | What's on it                                                        |
|-------------|---------------------------------------------------------------------|
| `/`         | Countdown and the full 46-band bill. Every band name links to their music; names in grey have nothing online. |
| `/schedule` | Who plays when, by day and stage.                                    |
| `/bands`    | One card per act, with a short blurb and where to buy from them.     |
| `/photos`   | The photo wall. Anyone can add a shot; no sign-in.                   |
| `/admin`    | Who uploaded what to the wall. Google sign-in, invited accounts only. |

## How to change things

Everything you'd normally want to edit lives in one file: **`app/lib/data.ts`**.
Open it in any plain text editor. Do not use Word.

### To fix a band name or blurb

Find the band in the `BANDS` list. Each one looks like this:

```ts
{n:"Dead Freddie", s:"store", base:"Chicago, IL",
 kind:"Punk-pop with roots in Chicago's South Side...",
 u:"https://deadfreddie.bandcamp.com/"},
```

- `n` — name shown on the site
- `base` — where they're from
- `kind` — the blurb on their card
- `u` — their main link (`u2` is an optional second link)
- `s` — `"store"` if they sell online, `"none"` if they don't. Cards marked
  `"none"` say "Catch them at the merch table."

Change the text between the quote marks. Leave the quote marks, colons and
commas exactly where they are.

### To change the schedule

Find `STAGES` and `DAYS` below the band list. `STAGES` holds the three stage
names. Under `DAYS`, each day has a start time and three lists of band names,
one per stage, in playing order. Set times are worked out automatically:
45-minute sets on the hour. Move a name between lists to move that band to a
different stage.

### To change when the photo wall is open

Find `WALL_OPENS` and `WALL_CLOSES`. Between those two moments anyone can add
to `/photos`; outside them only signed-in admins can, and everyone else sees a
note saying when it opens. They're set to the three festival days.

Write them as Chicago time — the time you'd read off a clock at the deli — in
the form `2026-09-11T00:00:00`. Daylight saving is worked out for you, so a
window set in December works the same as one in July. Setting both to `null`
shuts the wall to everyone but admins.

### To change the countdown

Find `DOORS`. It's set to Friday Sept 11, 5:00 PM. During the festival the
countdown swaps to a "happening right now" message, and afterwards — after the
date in `OVER` — to "That's a wrap."

### After any edit

Save the file and look at the browser; `npm run dev` reloads it for you. If
something breaks, the error appears on the page and names the line — undo your
last change.

## What's where

```
app/
  page.tsx              Home page
  schedule/page.tsx     Schedule page
  bands/page.tsx        Bands page
  layout.tsx            The bit every page shares: fonts, nav, footer
  globals.css           All the styling
  photos/page.tsx       Photo wall
  admin/                Admin panel (sign-in page + upload listing)
  api/wall/route.ts     Signs the browser's upload, if the wall is open to you
  api/auth/             Google sign-in, handled by Auth.js
  lib/data.ts           THE BAND LIST AND RUNNING ORDER — edit here
  lib/compressImage.ts  Shrinks a photo in the browser before it's uploaded
  lib/framePhoto.ts     Draws the polaroid frame for the download button
  components/           The moving parts: countdown, lineup, schedule grid
auth.ts                 Who's allowed into /admin
proxy.ts                Turns anyone else away at the door
public/assets/          Logos
legacy/                 The original single-file version of this site
```

## The admin panel

`/admin` is where uploads get approved. Nothing reaches the public wall on its
own: a photo lands in storage, appears under **Waiting on you**, and stays
invisible to everyone else until an admin approves it. Getting in takes a
Google account that's on the list.

The queue shows only what still needs deciding, so there's nothing to scroll
past. Photos already approved are tucked under **Already on the wall**, folded
shut, in case one needs taking down later.

Two buttons on each photo:

- **Approve** puts it on the wall. `/photos` shows approved photos and nothing
  else. On something already approved this button reads **Take down** instead,
  which returns it to the queue — nothing is lost.
- **Reject** deletes it. The file is erased from storage and the row from the
  database. It asks first, because there is no undo and nothing to restore
  from.

The verdicts live in a [Turso](https://turso.tech) database; the photos stay in
Blob storage.

### Adding someone

Open `.env.local` and add their Google address to `ADMIN_EMAILS`, separated by
a comma:

```
ADMIN_EMAILS=you@example.com,someone.else@gmail.com
```

(The real list lives in `.env.local` and in Vercel, not in this file — this
repository is public.)

Set the same variable in the Vercel project settings for the live site.
Anyone signing in with an address that isn't on the list is turned away — they
never get a session, so a stale login can't outlive being taken off the list.

### What has to be set

| Variable               | What it's for                                         |
|------------------------|-------------------------------------------------------|
| `GOOGLE_CLIENT_ID`     | From the Google Cloud OAuth client                     |
| `GOOGLE_CLIENT_SECRET` | Same place                                             |
| `AUTH_SECRET`          | Signs the login cookie. `openssl rand -base64 33`      |
| `ADMIN_EMAILS`         | Who's allowed in                                       |
| `BLOB_READ_WRITE_TOKEN`| Reads the wall. Already needed by `/photos`            |
| `TURSO_DATABASE_URL`   | The approval ledger                                    |
| `TURSO_AUTH_TOKEN`     | Same place                                             |

`.env.local` is for your machine only and is never committed. The live site
reads the same names from the Vercel project's environment variables.

### Google Cloud setup

The OAuth client needs both callback URLs listed under **Authorised redirect
URIs**, or sign-in fails with a redirect mismatch:

```
http://localhost:3000/api/auth/callback/google
https://YOUR-DOMAIN/api/auth/callback/google
```

## Putting it online

```bash
npm run build
```

Every page is prerendered as static HTML, so it will run anywhere. Easiest is
[Vercel](https://vercel.com) — point it at this repository and it builds and
deploys on its own. Netlify works the same way.

## Still to sort out

1. Stage names are placeholders: Deli Stage, Alley Stage, Lot Stage. So are all
   the set times. The schedule page says so in pink at the top.
2. The poster misspells Alex KASZNEL as "Kesznel." The site uses the correct
   spelling, which is what his Bandcamp says. Worth confirming with him.
3. Five bands couldn't be verified online because other acts share their names:
   The Horrids, The Steves, Bill Nelson, From the Start, and Tiger Uppercut.
   Asking the bands directly for their links would fix all five.
4. Rooftop / acoustic stage is still marked "coming soon."
5. Shannon's Deli is normally closed Sundays. Festival runs Fri–Sun, so it may
   be worth saying something about food on day three.
6. Admin sign-in is fine for the handful of people who need it, but two things
   are parked until more do:
   - Google's sign-in screen says "to continue to **WWBP**." That name belongs
     to an unrelated app sharing the same Google Cloud project, and it's set
     per project rather than per login. Fixing it properly means a Google
     Cloud project of Steve Fest's own and a fresh client ID and secret —
     nothing in the code changes, just the two values in the environment.
   - If that OAuth app is still in **Testing** mode, Google only lets accounts
     on its own test-user list through, *after* they've signed in. That looks
     nothing like being left off `ADMIN_EMAILS`, so it's the first thing to
     check if someone who's on our list still can't get in. Publishing the app
     removes the limit; it asks for no sensitive permissions, so there's no
     review to sit through.

   Past a handful of people, `ADMIN_EMAILS` stops being the right shape — a
   list you edit and redeploy is not something you want to do weekly.
