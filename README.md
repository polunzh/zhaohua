[中文](./README.zh-CN.md) | **English**

# Dawn Blossoms Plucked at Dusk (朝花夕拾)

> **Status:** This is not a serious project. I just thought it would be fun, and it was. It's not finished — I don't know if I'll ever finish it, or what "finished" would even mean for something like this. If you stumble upon it and find it interesting, that's nice.

> _I grew up in a village, and had two dreams._
>
> _One was to be a postman. Our village postman rode a green bicycle with a big canvas bag on the back. He knew everyone. When he came down the dirt road, dogs barked and kids ran out to see if there was a letter from someone's father working in the city. It was the job of delivering distant longing right to the doorstep._
>
> _The other was to be a primary school teacher. Our school was a row of brick houses with a flag pole on the playground. In winter the classroom had a coal stove that smoked when the wind shifted. The teacher knew every student by name — who was naughty, who hadn't done their homework again. The school had a flower garden. In summer it was full of all kinds of flowers, mostly roses, and the scent filled the whole campus, with bees humming through. In winter, only the bamboo was left._
>
> _I grew up. I became neither. But sometimes I still think about that postman's bicycle bell, and the chalk dust floating in the morning light of that classroom._
>
> _So I made this. It's not really a game — more like opening a window onto a life I never lived._

A life simulation set in 1990s rural China. Play as a village primary school teacher or a town postman, experiencing the quiet warmth of countryside daily life.

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

### Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm (the project uses pnpm as package manager)

### Setup

```bash
# Install dependencies
pnpm install

# Copy the environment template
cp .env.example .env
```

### AI Configuration (optional)

The game uses AI to generate NPC dialogue. Without an API key, NPC conversations will show an error — everything else works fine.

Create a `.env.local` file with your key:

```bash
echo 'AI_API_KEY=your-key-here' > .env.local
```

Supported models (set `AI_MODEL` in `.env`): `deepseek` (default), `kimi`, `minimax`, `openai`, `claude`

### Run

```bash
pnpm dev          # Frontend — http://localhost:5173
pnpm dev:server   # Backend  — http://localhost:3001
```

Both need to run at the same time. The frontend proxies API requests to the backend.

### Test

```bash
pnpm test         # 308 unit tests
pnpm test:e2e     # 26 e2e tests (needs both servers running)
```

## License

MIT
