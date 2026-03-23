# 前端重做实现计划

> **TDD 开发，写测试 → 验证失败 → 实现 → 验证通过 → 提交**

**Goal:** 将前端从占位 Canvas 重做为像素风 RPG 游戏界面

**Tech:** Vue 3 + Canvas Tile Map + 代码生成像素素材

---

## 决策澄清

- **Tile 素材：** 代码生成（Canvas API 绘制像素图块），不依赖外部素材文件
- **玩家角色：** 点击地图位置移动（click-to-move），不是键盘控制。点击 NPC 触发对话
- **视口：** 场景不大，不需要滚动视口，整个地图一屏显示

---

## Task 1: Tile Map 引擎核心

**文件：**

- `src/tilemap/engine.ts`（新）— TileMap 类：加载地图数据、多层渲染、坐标转换
- `src/tilemap/types.ts`（新）— 类型定义
- `tests/tilemap/engine.test.ts`（新）

核心功能：

- TileMap 类接受地图数据（二维数组）和 tile 尺寸（16px）
- 多层渲染：ground → objects → characters → overlay
- tileToPixel / pixelToTile 坐标转换
- 碰撞检测：isTileWalkable(x, y)

## Task 2: Tile 素材代码生成

**文件：**

- `src/tilemap/tileset.ts`（新）— 用 Canvas API 生成所有 tile 图块
- `tests/tilemap/tileset.test.ts`（新）

用旧时光色板代码绘制：

- 地面 tile：土地(#D4C08E)、草地(#7A9178)、教室地板(#C9A882)、路(#C9A882)
- 墙壁 tile：红砖墙(#C4706A)、屋顶(#8B4513)
- 物体 tile：桌子(#8B6914)、黑板(#3a3530)、窗户(#A8B8B0)、门(#6B5B4E)
- 自然 tile：树冠(#7A9178)、树干(#6B5B4E)、花(#C4706A/#d88a84/#e8c84a)、竹子(#5a7a58)、水塔(#A8B8B0)
- 旗杆、篮球架、长椅、水龙头等

## Task 3: 角色 Sprite 系统

**文件：**

- `src/tilemap/sprites.ts`（新）— 代码生成角色 sprite + 渲染
- `tests/tilemap/sprites.test.ts`（新）

- 24×32 像素角色，4 方向面朝
- 代码绘制：发型（颜色区分）、脸、身体（衣服颜色区分）、腿
- 每个 NPC 配置：{ spriteConfig: { hairColor, bodyColor, legColor } }
- 渲染函数：drawCharacter(ctx, x, y, npc, direction, frame)
- 名字标签 + emoji 心情

## Task 4: 校园地图数据

**文件：**

- `src/tilemap/maps/campus.ts`（新）— 校园俯视图 tile map 数据
- `src/tilemap/maps/classroom.ts`（新）— 教室内部
- `src/tilemap/maps/office.ts`（新）— 办公室内部

每个地图：

- ground 层（地面）
- objects 层（建筑、家具、植物）
- collision 层（可走/不可走）
- 入口/出口点标记

校园地图布局按设计：上操场、中教学楼、左花池（密花+竹）、右水塔、下校门

## Task 5: UI 布局重构

**文件：**

- `src/App.vue` — 重写布局
- `src/components/GameCanvas.vue` — 重写，用 TileMap 引擎
- `src/components/SidePanel.vue`（新）— 左侧信息栏
- `src/components/DialogBox.vue` — 调整样式适配新布局
- `src/components/ChoicePanel.vue` — 移入 DialogBox 内部

布局：

```
┌──────────┬─────────────────────────┐
│ SidePanel│     GameCanvas          │
│ 时间天气  │     (Tile Map)          │
│ 事件日志  │                         │
│ 导航     │                         │
│ 角色切换  │                         │
├──────────┴─────────────────────────┤
│          DialogBox + Choices        │
└────────────────────────────────────┘
```

## Task 6: 交互接线

**文件：**

- `src/App.vue`
- `src/components/GameCanvas.vue`

- 点击地图上的 NPC → 触发对话（复用现有 API）
- 点击地图出口区域 → 调 moveToLocation API → 切换地图
- NPC 按日程出现在对应位置
- 旧时光滤镜应用到整个 Canvas

## Task 7: 删除旧代码

- 删除 `src/scene/renderer.ts`（旧 Canvas 渲染器）
- 删除 `src/scene/scenes.ts`（旧场景定义）
- 保留 `src/scene/filter.ts`（滤镜）
- 更新 `tests/scene/filter.test.ts`（路径可能变）
