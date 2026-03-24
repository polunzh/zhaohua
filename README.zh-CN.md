**中文** | [English](./README.md)

# 朝花夕拾

一款基于 Web 的生活模拟，体验 1990 年代中国北方农村的日常——当一名村小学老师，或当一名镇上的邮递员。

## 功能

- **实时世界** — 游戏时间与现实同步，你不在的时候世界继续运转。
- **双线体验** — 老师线和邮递员线，随时切换。
- **12 个场景** — 学校（教室、操场、花池、水塔、办公室）、村子（土路、农田、村民家）、镇上（邮局、集市、卫生所）。
- **NPC 系统** — 有日程、有情绪、有关系，会因你的选择而变化。
- **事件系统** — 日常琐事、季节事件、长线故事。
- **AI 对话** — NPC 对话由 AI 生成，带有 90 年代农村味道。支持 DeepSeek、Kimi、MiniMax、OpenAI、Claude。
- **旧时光画面** — 仿柯达 Gold 200 胶片色调，手绘插画风格。

## 技术栈

- **前端：** Vue 3、Canvas API
- **后端：** Nitro
- **数据库：** SQLite (better-sqlite3)
- **工具链：** VitePlus (Vite + Rolldown + Vitest + Oxc)
- **AI：** 多模型适配器（OpenAI 兼容 + Anthropic）

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置 AI API Key
echo 'AI_API_KEY=your-key-here' > .env.local

# 启动开发
pnpm dev          # 前端 (端口 5173)
pnpm dev:server   # 后端 (端口 3001)

# 运行测试
pnpm test
```

## 许可证

MIT
