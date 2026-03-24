# 可玩性增强实现计划

> TDD 开发

## Task 1: 待办事项数据层

**测试先行 → 实现**

- 新增 todos 表到 schema
- CRUD queries: addTodo, getTodos, completeTodo, expireTodos
- 测试：增删改查、过期处理

## Task 2: 待办生成引擎

**测试先行 → 实现**

- `server/engine/todos.ts` — generateTodos(db, tickCount, character)
- 按离线时长控制生成数量
- 老师线/邮递员线各自的待办类型
- 测试：不同离线时长生成正确数量、类型正确

## Task 3: 选择后果引擎

**测试先行 → 实现**

- `server/engine/consequences.ts` — processConsequences(db, gameDate)
- 检查 3-7 天前的选择，生成后果事件
- 影响 NPC 状态
- 测试：鼓励后产生正面后果、批评后产生负面后果、时间窗口正确

## Task 4: 简报 API

**测试先行 → 实现**

- GET /api/briefing — 聚合：离线时长、事件摘要、待办列表、故事进展、后果通知
- POST /api/todo/complete — 标记完成
- 测试：简报数据结构正确、待办完成状态变化

## Task 5: 事件密度控制

**修改 catch-up.ts**

- 追算时按离线时长计算目标事件数
- 均匀分布在 tick 中，不是每步都触发
- 测试：短离线少事件、长离线多事件但有上限

## Task 6: 开屏简报 UI + 待办侧边栏

- `src/components/Briefing.vue` — 简报面板
- App.vue 流程：加载 → 显示简报 → 点击"开始" → 进入场景
- SidePanel 增加待办列表区域
