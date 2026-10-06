# TREBLR — Life in the Music

A world-first Next.js artist-life game: move through a lived-in apartment, create and release music, build a career, travel between music cities, develop relationships, and grow a connected online presence.

## Run locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
npm start
```

## The world

- `/` — cinematic apartment, interactive hotspot objects, game HUD, expandable in-world phone and career/studio/city panels
- `/world` — full 12-city map, ticket costs, and travel transitions
- `/social` — the 12-account artist social hub
- `/social/[platform]` — individual Instagram, TikTok, X, YouTube, Spotify, Apple Music, SoundCloud, Audiomack, Threads, Facebook, Twitch, and Snapchat-style views

Game progress is saved in the browser using local storage. The people, music services, labels, shows, and posts depicted in TREBLR are fictional simulation content; no real social platform accounts are connected.
