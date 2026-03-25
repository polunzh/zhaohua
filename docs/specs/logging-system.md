# 日志系统设计

## 目标

为项目添加结构化日志，上线后能快速定位问题。要求详细记录，覆盖所有关键路径。

## 决策

| 项           | 决定                           | 原因                                  |
| ------------ | ------------------------------ | ------------------------------------- |
| 日志库       | consola                        | UnJS 生态标配，Nitro 原生兼容，零配置 |
| 粒度         | 详细                           | 方便排查，宁多勿少                    |
| AI prompt    | 不记录内容                     | 太长，暂不需要                        |
| 输出格式     | 开发 human-readable，生产 JSON | Vercel/CloudFlare 日志系统可解析 JSON |
| 前端错误收集 | 暂不做                         | 只在 console 看                       |
| 外部监控     | 暂不接入                       | 等有生产部署再说                      |

## 后端日志

### 1. logger 模块 — `server/utils/logger.ts`

基于 consola 封装，提供带 tag 的子 logger：

```ts
import { consola, type ConsolaInstance } from "consola";

// 生产环境输出 JSON，开发环境 human-readable（consola 默认行为）
if (process.env.NODE_ENV === "production") {
  consola.options.formatOptions = { columns: 0 }; // 紧凑输出
}

export const logger = consola;

export function createLogger(tag: string): ConsolaInstance {
  return consola.withTag(tag);
}
```

使用方式：各模块通过 `createLogger("模块名")` 获取带标签的 logger。

### 2. 请求日志中间件 — `server/middleware/log.ts`

Nitro 中间件，统一记录每个请求：

```
→ POST /api/dialogue  {npcName: "小明", ...}
← POST /api/dialogue  200 123ms
```

记录内容：

- 请求：method、path、body（POST 请求）
- 响应：status、耗时
- 错误：完整 error stack

### 3. 各模块日志点

#### AI adapter (`server/ai/adapter.ts`)

| 事件     | Level | 内容                          |
| -------- | ----- | ----------------------------- |
| 调用开始 | debug | 模型名、prompt 长度（字符数） |
| 调用成功 | info  | 模型名、耗时、响应长度        |
| 调用失败 | error | 模型名、HTTP status、错误信息 |

不记录 prompt 和响应的具体内容。

#### DB 连接 (`server/db/connection.ts`)

| 事件          | Level | 内容                 |
| ------------- | ----- | -------------------- |
| 初始化        | info  | 数据库路径、WAL 模式 |
| Schema 初始化 | info  | 完成确认             |

#### 游戏引擎 (`server/engine/*.ts`)

| 事件      | Level | 内容                         |
| --------- | ----- | ---------------------------- |
| tick 执行 | debug | 当前游戏日期、时间段         |
| catch-up  | info  | 跳过天数、处理的事件数       |
| 故事推进  | info  | 故事弧 ID、新阶段            |
| 后果触发  | info  | consequence 类型、影响的 NPC |
| 任务生成  | debug | mission ID、类型             |
| 考试/周报 | info  | 关键结果                     |

#### Handler 层 (`server/handlers/*.ts`)

Handler 层**不额外加日志**，原因：

- 请求中间件已经记录了入口/出口
- Handler 内部调用的 engine/AI/DB 模块各自有日志
- 避免重复记录

只在 handler 内有特殊分支逻辑时加 debug 日志（如 dialogue handler 的 NPC 状态回退）。

### 4. 全局错误处理

在 Nitro 配置中加 error handler，捕获未处理的异常：

```ts
// nitro.config.ts 或 server/middleware/error.ts
// 记录 fatal 级别日志，返回统一错误格式
```

## 前端日志

### `src/utils/logger.ts`

轻量封装，不引入新依赖：

```ts
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => isDev && console.debug("[zhaohua]", ...args),
  info: (...args: any[]) => console.info("[zhaohua]", ...args),
  warn: (...args: any[]) => console.warn("[zhaohua]", ...args),
  error: (...args: any[]) => console.error("[zhaohua]", ...args),
};
```

### API client 错误处理 (`src/api/client.ts`)

在每个 fetch 调用后加统一的响应检查：

```ts
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const start = performance.now();
  const res = await fetch(url, options);
  const elapsed = Math.round(performance.now() - start);

  if (!res.ok) {
    const text = await res.text();
    logger.error(`API ${options?.method || "GET"} ${url} → ${res.status} (${elapsed}ms)`, text);
    throw new Error(`API error ${res.status}: ${text}`);
  }

  logger.debug(`API ${options?.method || "GET"} ${url} → ${res.status} (${elapsed}ms)`);
  return res.json();
}
```

所有 client 函数改用这个 `request()` 封装。

## 文件清单

| 操作     | 文件                                                             |
| -------- | ---------------------------------------------------------------- |
| 新建     | `server/utils/logger.ts`                                         |
| 新建     | `server/middleware/log.ts`                                       |
| 新建     | `src/utils/logger.ts`                                            |
| 修改     | `server/ai/adapter.ts` — 加 AI 调用日志                          |
| 修改     | `server/db/connection.ts` — 加初始化日志                         |
| 修改     | `server/engine/*.ts` — 加引擎事件日志                            |
| 修改     | `server/handlers/dialogue.post.ts` — 把静默 catch 改为 warn 日志 |
| 修改     | `src/api/client.ts` — 统一错误处理                               |
| 修改     | `nitro.config.ts` — 全局错误处理                                 |
| 新增依赖 | `consola`                                                        |

## 不做的事

- 不做日志文件写入/轮转（stdout 交给平台）
- 不接 Sentry 等外部服务
- 不做前端错误上报
- 不记录 AI prompt/响应内容
- 不做请求 tracing（单服务不需要）
