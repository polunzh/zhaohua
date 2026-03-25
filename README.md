[中文](./README.zh-CN.md) | **English**

# Zhaohua (朝花夕拾)

A life simulation game set in 1990s rural China. Play as a village primary school teacher or a town postman, experiencing the warmth and simplicity of countryside daily life.

## Screenshots

| Briefing                                   | Classroom                                    |
| ------------------------------------------ | -------------------------------------------- |
| ![Briefing](docs/screenshots/briefing.png) | ![Classroom](docs/screenshots/classroom.png) |

| Flower Pool                                      | Dialogue                                   |
| ------------------------------------------------ | ------------------------------------------ |
| ![Flower Pool](docs/screenshots/flower-pool.png) | ![Dialogue](docs/screenshots/dialogue.png) |

## Features

- **Cartoon vector art** — SVG scenes with warm, desaturated palette inspired by children's picture books
- **Real-time world** — Game time syncs with real time; the world keeps running when you're away
- **Two characters** — Teacher and postman, switch anytime
- **12 illustrated scenes** — Classroom, playground, flower pool, village road, market, post office, and more
- **NPC interaction** — 11 characters with schedules, moods, affinity, and contextual choices
- **Energy system** — 5 interactions per day forces meaningful choices
- **Affinity gates** — Low-trust NPCs refuse to talk; high-trust NPCs share secrets
- **Daily missions** — A new objective each day with one-click navigation
- **Conflict events** — Student fights, angry parents, broken windows — resolve with consequences
- **Student exams** — Semester grades computed from your interactions
- **Story arcs** — 3 branching stories that depend on your choices
- **Gift collection** — NPCs give you items at high affinity
- **Travel events** — Random encounters when moving between locations
- **Streak system** — Daily login rewards (Wordle/Duolingo style)
- **AI dialogue** — Context-aware NPC conversations. Supports DeepSeek, Kimi, MiniMax, OpenAI, Claude
- **308 tests** — Comprehensive unit + e2e coverage

## Tech Stack

- **Frontend:** Vue 3, SVG, PixiJS
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
