[中文](./README.zh-CN.md) | **English**

# Zhaohua (朝花夕拾)

A pixel-art RPG life simulation set in 1990s rural China, inspired by Stardew Valley's visual style. Play as a village primary school teacher or a town postman navigating daily life in a small northern community.

## Features

- **Pixel RPG visuals** — Stardew Valley-inspired tile maps with Kodak Gold 200 color grading and seasonal/weather changes.
- **Real-time world** — Game time syncs with real time; the world keeps running when you're away.
- **Two character lines** — Teacher and postman, switch anytime.
- **16 locations** — School, village, town, and student homes — each with hand-crafted tile maps.
- **NPC interaction** — Characters with schedules, moods, and relationships. Contextual choice menus let you check homework, encourage students, chat with villagers, and more.
- **Daily missions** — A new objective each day to guide exploration.
- **Gift collection** — NPCs may give you gifts based on your choices and relationship.
- **Travel events** — Random encounters when moving between locations, varying by season and weather.
- **Streak system** — Daily login rewards with milestone toasts at 3, 7, 14, and 30 days.
- **Student grades & relationship panel** — Track each student's academic progress and your bond with every NPC.
- **AI dialogue** — NPC conversations generated with 1990s rural flavor. Supports DeepSeek, Kimi, MiniMax, OpenAI, Claude.
- **Toast notifications** — In-game feedback for mission completion, gifts, and streaks.
- **224 unit tests + 14 e2e tests** — Comprehensive test coverage.

## Tech Stack

- **Frontend:** Vue 3, Canvas API
- **Backend:** Nitro
- **Database:** SQLite (better-sqlite3)
- **Toolchain:** VitePlus (Vite + Rolldown + Vitest + Oxc)
- **AI:** Multi-model adapter (OpenAI-compatible + Anthropic)

## Getting Started

```bash
# Install dependencies
pnpm install

# Configure AI API key
echo 'AI_API_KEY=your-key-here' > .env.local

# Start development
pnpm dev          # Frontend (port 5173)
pnpm dev:server   # Backend (port 3001)

# Run tests
pnpm test
```

## License

MIT
