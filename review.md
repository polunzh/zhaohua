# Review Log

## Review v1

- 时间：2026-03-23 11:29:07 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`

### 发现的问题

1. 实时 1:1 推进与“1994-2002 年时间跨度”存在根本冲突。文档一方面要求世界与现实时间同步，另一方面又把体验跨度设为从某个秋季开学开始、覆盖 1994-2002 年。按字面实现，玩家需要接近 8 年现实时间才能走完整个时间线，学年推进、角色成长、长线剧情都会变得不可达。这里必须先定义“现实时间到游戏日历时间”的映射规则。参考：[docs/specs/2026-03-23-zhaohua-design.md#L5](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L5) [docs/specs/2026-03-23-zhaohua-design.md#L11](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L11) [docs/specs/2026-03-23-zhaohua-design.md#L57](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L57)

2. 世界状态的权威来源没有定义，后续一定会导致一致性问题。文档描述的是一个老师线和邮递员线交织的共享世界，但推进方式又是“用户打开页面时根据上次关闭到现在的时间差进行追算”，同时后端不持续运行。这样就留下一个关键问题：这是每个玩家自己的世界，还是所有玩家共享的一个世界？如果不先定下来，并发访问、角色切换、NPC 连续性都没法自洽。参考：[docs/specs/2026-03-23-zhaohua-design.md#L19](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L19) [docs/specs/2026-03-23-zhaohua-design.md#L33](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L33) [docs/specs/2026-03-23-zhaohua-design.md#L76](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L76) [docs/specs/2026-03-23-zhaohua-design.md#L91](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L91)

3. 规范把世界的规范性状态推进交给了非确定性的 AI 生成。文档支持用户自行选择模型和 API Key，同时又让 AI 参与事件生成和长线故事推进。这意味着同样的时间流逝，在不同模型、不同版本、不同 prompt 漂移下，可能生成不同的世界历史。这是规格层面的完整性风险。更合理的做法是：世界状态转移必须是确定性的，AI 只负责润色表达；或者必须定义严格的结构化输出和校验约束。参考：[docs/specs/2026-03-23-zhaohua-design.md#L84](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L84) [docs/specs/2026-03-23-zhaohua-design.md#L87](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L87) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89) [docs/specs/2026-03-23-zhaohua-design.md#L180](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L180)

4. “按小时追算”对文档承诺的体验粒度来说过于粗糙。文档强调早晨到校、课间、水塔排队喝水、邮递路线上的途中相遇等具体时刻，但时间引擎只按小时步长检查事件。这样在 7:20、9:45 或送信半途中打开页面时，要么落在错误场景，要么就需要一个文档里并未定义的更细粒度系统来兜底。参考：[docs/specs/2026-03-23-zhaohua-design.md#L34](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L34) [docs/specs/2026-03-23-zhaohua-design.md#L38](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L38) [docs/specs/2026-03-23-zhaohua-design.md#L44](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L44) [docs/specs/2026-03-23-zhaohua-design.md#L80](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L80)

5. 持久化模型对目标行为来说定义得太粗。SQLite 里只列了天气、季节、NPC 心情、选择历史等大类，但这不足以支持“错过事件摘要可回溯”“信件投递链路”“待处理事项”“事件因果关系”“长线故事连续性”等行为。另外，文档说用户要配置自己的 API Key，但没有定义这些密钥最终存在哪里，是浏览器本地、Nitro 后端，还是其他安全存储。这会直接影响实现边界和安全模型。参考：[docs/specs/2026-03-23-zhaohua-design.md#L73](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L73) [docs/specs/2026-03-23-zhaohua-design.md#L87](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L87) [docs/specs/2026-03-23-zhaohua-design.md#L91](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L91) [docs/specs/2026-03-23-zhaohua-design.md#L115](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L115)

### 待确认问题

- 这是单人私有世界，还是所有玩家共享的全局世界？
- AI 只负责文本表达，还是负责世界状态的规范性推进？
- 现实时间和游戏内日历时间之间的压缩/映射规则是什么？

### 结论

氛围和产品方向是成立的，但当前设计文档还不适合直接进入实现。最先要补齐的是时间模型、世界状态权威来源，以及 AI 在系统中的边界定义。

### ✅ Review v1 已处理 — 2026-03-23

所有 5 个问题已在设计文档中改进：

| # | 问题 | 改进措施 |
|---|------|----------|
| 1 | 时间映射冲突 | 默认实时同步，支持"跳到下一天/下周/下学期"加速操作 |
| 2 | 世界权威来源 | 明确为单人私有世界 |
| 3 | AI 非确定性 | AI 只负责文本表达，世界状态转移由确定性规则引擎驱动 |
| 4 | 追算粒度太粗 | 从小时改为 15 分钟步长 |
| 5 | 存储模型不足 | 补充事件日志、信件追踪、故事因果等字段；API Key 存后端 .env |

待确认问题已全部在设计文档中明确回答。

## Review v2

- 时间：2026-03-23 11:44:47 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`

### 对 v1 已处理项的复核

- v1 的问题 2、3、4、5 都有实质性补充：世界归属已明确为单人私有世界，AI 被收束到文本表达层，追算粒度细化到 15 分钟，存储项也补了事件日志、故事进度和信件追踪。方向是对的。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L86](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L86) [docs/specs/2026-03-23-zhaohua-design.md#L96](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L96) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99)
- v1 的问题 1 只算部分关闭。文档现在给了“默认实时 + 可跳天/跳周/跳学期”的方向，但还没有定义跳时之后的时间锚点规则。否则“现实 1 天 = 游戏内 1 天”和“默认按实时走”在发生跳时后该如何继续成立，仍然不够精确。参考：[docs/specs/2026-03-23-zhaohua-design.md#L15](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L15) [docs/specs/2026-03-23-zhaohua-design.md#L63](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L63) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89)

### 发现的问题

1. “用户可在设置中配置自己的 API Key”和“API Key 存在后端环境变量（.env）”是互相冲突的。`.env` 是部署时静态配置，不是运行时玩家设置存储；按当前文案实现，玩家就无法在产品内真正录入、修改、切换自己的 Key。若试图把用户输入回写 `.env`，又会引入写权限、热加载、密钥生命周期和多环境配置问题。这是这次修正文档里新增出来的硬冲突。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L108](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L108)

2. 15 分钟步进和“跳到下个学期/长时间离线”组合后，没有任何性能边界或摘要折叠规则。一次“跳到下个学期”或几个月不登录，很容易产生上万次 tick；规格只写了“快速模拟”和“批量追算”，但没有定义分层快进、事件聚合、摘要裁剪、最大追算窗口或超时兜底。这样会直接冲击“每次打开几分钟即可”的体验目标。参考：[docs/specs/2026-03-23-zhaohua-design.md#L39](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L39) [docs/specs/2026-03-23-zhaohua-design.md#L62](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L62) [docs/specs/2026-03-23-zhaohua-design.md#L86](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L86) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89) [docs/specs/2026-03-23-zhaohua-design.md#L196](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L196)

3. 单人私有世界解决了“多人共享世界”的歧义，但没有解决“同一玩家并发打开”的一致性问题。后端只在访问时启动计算，如果同一玩家在两个标签页或两个设备上同时进入，很可能拿到同一个上次访问时间并重复追算同一时间段，导致事件日志、信件投递状态、故事阶段被重复推进。这里必须补上幂等键、乐观锁或串行化规则。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L82](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L82) [docs/specs/2026-03-23-zhaohua-design.md#L85](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L85) [docs/specs/2026-03-23-zhaohua-design.md#L102](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L102)

### 还缺的约束

- 需要明确“跳到下一天/下周/下学期”之后，现实时间与游戏时间的精确映射公式，例如是否引入一个持久化的 `calendar_offset` 或新的时间锚点。否则时间系统只能描述方向，不能描述实现。参考：[docs/specs/2026-03-23-zhaohua-design.md#L15](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L15) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89)
- 需要明确规则引擎的随机种子来源、持久化粒度，以及事件重放时的去重键。现在只写“保证可复现”，但没有说明靠什么复现。参考：[docs/specs/2026-03-23-zhaohua-design.md#L96](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L96) [docs/specs/2026-03-23-zhaohua-design.md#L193](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L193)
- 需要明确老师线和邮递员线的操控关系：是开局二选一、允许中途切换，还是两个主角都可玩但未操控者按 NPC 逻辑自动推进。否则“玩家选择历史”和“长线故事进度”很难做成稳定的数据模型。参考：[docs/specs/2026-03-23-zhaohua-design.md#L19](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L19) [docs/specs/2026-03-23-zhaohua-design.md#L103](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L103) [docs/specs/2026-03-23-zhaohua-design.md#L104](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L104) [docs/specs/2026-03-23-zhaohua-design.md#L196](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L196)

### 结论

这版文档相比 v1 明显更可实现，旧问题大部分都得到了正面回应；但它还不能直接进入实现。优先补齐 API Key 的配置模型、长跨度追算的性能策略，以及并发追算的幂等约束，当前方案才算真正收敛。

## Review v2

- 时间：2026-03-23 11:45:23 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`
- 评审背景：基于“Review v1 已处理”的新版设计文档重新评审

### 发现的问题

1. `API Key` 的配置方案与“用户可在设置中选择模型并配置自己的 API Key”仍然互相冲突。文档前面明确写了用户可在设置中选择模型并配置自己的 API Key，但后面又把模型选择和 API Key 定义为存放在后端 `.env`。这两者对应的是两种完全不同的产品形态：`.env` 适合部署级、单套固定配置，不适合 Web 应用里用户通过设置页动态录入、切换、保存自己的密钥。如果按当前规格实现，设置页要么只是摆设，要么就需要服务端额外的用户级安全存储方案，而文档还没有定义。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107)

### 已解决的问题

- `Review v1` 中关于时间映射、世界权威来源、AI 非确定性、追算粒度、存储模型粗糙的问题，这一版文档都已做出有效修正。

### 待确认问题

- 产品到底是“部署者在后端统一配置模型/API Key”，还是“最终玩家在设置页录入并保存自己的 API Key”？这两个方向只能选一个，再决定具体存储方案。

### 结论

这版设计文档已经比 `Review v1` 时可落地得多，核心世界模型也基本自洽。当前主要剩下的是 AI 密钥配置边界还没定清楚；这个问题不大，但必须在开始做设置页和后端接口前先定掉。

## Review v3

- 时间：2026-03-23 11:46:34 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`
- 评审背景：基于当前 `review.md` 已有“Review v1 已处理”说明后的再次复审；本条作为最新有效结论

### 对旧问题修正情况的判断

- `Review v1` 的世界权威来源、AI 边界、追算粒度、存储项粗糙这 4 个问题，本版文档都给出了实质性修正，方向成立。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L86](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L86) [docs/specs/2026-03-23-zhaohua-design.md#L96](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L96) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99)
- `Review v1` 的时间映射冲突只算部分修正。现在有了“默认实时 + 可跳天/跳周/跳学期”的方向，但没有定义跳时后的时间锚点如何重建，所以还不能直接落实现。参考：[docs/specs/2026-03-23-zhaohua-design.md#L15](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L15) [docs/specs/2026-03-23-zhaohua-design.md#L63](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L63) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89)

### 发现的问题

1. 新版文档引入了一个明确的新冲突：一边说用户可在设置中选择模型并配置自己的 `API Key`，另一边又把模型选择和密钥定义为后端 `.env` 配置。这两种方案对应的是两套不同产品边界，当前写法无法同时成立。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L108](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L108)

2. 15 分钟步进虽然解决了场景粒度问题，但与“跳到下周/下学期”和“长时间离线后补算”组合时，又引入了新的性能风险。文档还没有定义分层快进、事件聚合、摘要裁剪或最大追算窗口，MVP 很容易在首次打开或跳时操作上卡死。参考：[docs/specs/2026-03-23-zhaohua-design.md#L39](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L39) [docs/specs/2026-03-23-zhaohua-design.md#L62](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L62) [docs/specs/2026-03-23-zhaohua-design.md#L86](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L86) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89)

3. 单人私有世界并不等于没有一致性风险。当前规格仍然没有约束“同一玩家多标签页/多设备同时打开”时的幂等与串行化策略；后端只在访问时计算，重复追算同一时间段会直接污染事件日志和故事进度。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L82](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L82) [docs/specs/2026-03-23-zhaohua-design.md#L85](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L85) [docs/specs/2026-03-23-zhaohua-design.md#L102](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L102)

### 还缺的约束

- 需要定义跳时后的时间映射公式，例如是否持久化 `calendar_offset`、何时重置时间锚点、恢复实时推进后按什么规则继续同步。参考：[docs/specs/2026-03-23-zhaohua-design.md#L15](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L15) [docs/specs/2026-03-23-zhaohua-design.md#L89](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L89)
- 需要定义规则引擎的随机种子来源、持久化粒度，以及事件重放时的去重键；否则“保证可复现”仍然缺少可执行约束。参考：[docs/specs/2026-03-23-zhaohua-design.md#L96](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L96) [docs/specs/2026-03-23-zhaohua-design.md#L193](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L193)
- 需要明确老师线和邮递员线的操控关系，以及未被操控主角的自动推进规则；否则玩家选择历史和长线故事进度仍然不好落表。参考：[docs/specs/2026-03-23-zhaohua-design.md#L19](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L19) [docs/specs/2026-03-23-zhaohua-design.md#L103](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L103) [docs/specs/2026-03-23-zhaohua-design.md#L104](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L104)

### 结论

这版设计文档比 `Review v1` 时成熟不少，但还没到可以直接开工实现的程度。旧问题大多已被修正，当前真正需要先收紧的是 `API Key` 配置边界、长跨度追算策略，以及访问时追算的幂等约束。

### ✅ Review v2 + v3 已处理 — 2026-03-23

v2 和 v3 的问题基本一致（v3 是 v2 的更完整版本），统一处理：

| # | 问题 | 改进措施 |
|---|------|----------|
| 1 | API Key 配置冲突 | 统一为后端 .env 配置，去掉前端设置页描述 |
| 2 | 长时间追算性能 | 增加追算性能约束：离线超 7 天切天级粗粒度追算，摘要上限 20 条 |
| 3 | 并发标签页一致性 | 追算过程加 SQLite 写锁事务，同时刻只允许一个追算执行 |
| 4 | 跳时后时间锚点 | 增加 calendar_offset 机制，跳时后现实时间重新锚定 |
| 5 | 随机种子可复现 | 留给实现计划阶段细化（设计方向不受影响） |
| 6 | 两条线切换机制 | 明确可随时切换，未操控角色按 NPC 逻辑自动推进 |

## Review v4

- 时间：2026-03-23 11:49:36 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`
- 评审背景：基于当前 `review.md` 已新增“Review v2 + v3 已处理”说明后的再次复审

### 对旧问题修正情况的复核

- `Review v1 / v2 / v3` 中关于 `API Key` 配置冲突、长跨度追算性能、并发追算、跳时锚点，以及双主角切换规则的问题，这一版文档都已经补上了明确约束，不再是此前那种无法直接设计实现的空白。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L93](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L93) [docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99) [docs/specs/2026-03-23-zhaohua-design.md#L113](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L113)
- 但“保证可复现”还不能算真正闭环。文档虽然把 AI 从状态推进里拿掉，并补上了“事件池 + 触发条件 + 随机种子”的方向，但还没有定义种子如何派生、何时持久化、重放时如何去重，所以这部分仍然只是方向性修正，不是可直接编码的约束。参考：[docs/specs/2026-03-23-zhaohua-design.md#L101](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L101) [docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)

### 发现的问题

1. 把 `API Key` 统一改到后端 `.env`，确实修掉了旧冲突，但同时又把产品边界从“玩家使用的 Web 应用”收缩成了“部署者自用的单人私有部署”，而文档前面仍写“每个玩家拥有自己独立的世界实例”。这会让 MVP 的交付形态变得不清楚：到底是一套部署只服务一个人，还是同一套部署里允许多个玩家各自拥有世界实例。这个歧义是这轮修正后新暴露出来的问题，会直接影响账号体系、数据隔离、配置方式和运维假设。参考：[docs/specs/2026-03-23-zhaohua-design.md#L27](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L27) [docs/specs/2026-03-23-zhaohua-design.md#L70](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L70) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99) [docs/specs/2026-03-23-zhaohua-design.md#L113](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L113)

2. “离线超过 7 天切天级粗粒度追算 + 摘要最多 20 条”会和“双主角切换后可以看到对方在你不操控期间做了什么”的承诺直接打架。当前文档没有定义：在粗粒度追算时，另一主角的哪些行动必须被保留为可回看的轨迹，哪些可以被折叠成摘要。如果这点不先写清楚，长时间离线后再切角色，很可能只剩压缩过的概述，叙事连续性会断。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L109](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L109) [docs/specs/2026-03-23-zhaohua-design.md#L195](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L195)

3. 写锁串行化只解决了“不要重复追算”，没有解决“等待多久算失败、失败后怎么恢复”的可用性问题。现在文档只规定第二个标签页/设备等待锁释放，但没有定义锁等待超时、前端提示、异常退出后的回滚与重试策略。对于长离线补算或服务中断，这会把一致性问题转成卡死或假死问题。参考：[docs/specs/2026-03-23-zhaohua-design.md#L84](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L84) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94)

### 还缺的约束

- 需要明确 MVP 的部署模型：是“单部署单玩家”，还是“单部署多玩家但每人独立世界”；如果是前者，建议把“每个玩家拥有自己独立的世界实例”改写成更精确的部署级表述，避免把实现边界说大。参考：[docs/specs/2026-03-23-zhaohua-design.md#L27](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L27) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99) [docs/specs/2026-03-23-zhaohua-design.md#L113](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L113)
- 需要明确粗粒度追算下哪些事件绝不能被折叠，至少应覆盖另一主角的关键行动、信件状态变化、玩家已触发长线故事的阶段迁移；否则“摘要最多 20 条”只能保性能，保不住叙事连续性。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L109](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L109) [docs/specs/2026-03-23-zhaohua-design.md#L110](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L110) [docs/specs/2026-03-23-zhaohua-design.md#L195](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L195)
- 需要明确随机种子的派生公式、持久化位置，以及事件级幂等键/重放键；否则“保证可复现”仍然只是口头承诺。参考：[docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)
- 需要明确写锁的等待上限、超时后的用户提示，以及崩溃中断后的恢复路径；否则并发约束仍然缺少完整的运行时闭环。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94)

### 结论

这版文档已经把前几轮评审里最硬的冲突大多收掉了，明显比之前更接近可实现状态。当前剩下的重点不再是”大方向错了”，而是几个会在实现期立刻咬人的边界：MVP 到底是什么部署形态、双主角轨迹在粗粒度追算下如何保真，以及可复现与锁恢复的运行时约束还没有写死。

### ✅ Review v4 已处理 — 2026-03-23

| # | 问题 | 处理 |
|---|------|------|
| 1 | 部署模型措辞模糊 | 已改为”单部署单玩家”，去掉”每个玩家”的多用户暗示 |
| 2 | 粗粒度追算下叙事保真 | 留给实现计划阶段细化（属实现细节，不改设计方向） |
| 3 | 写锁超时恢复 | 留给实现计划阶段细化（属实现细节） |
| 还缺的约束 | 随机种子、锁恢复、粗粒度事件保留规则 | 均留给实现计划阶段（符合”克制，不过度设计”原则） |

## Review v5

- 时间：2026-03-23 12:05:42 CST
- 评审对象：`docs/specs/2026-03-23-zhaohua-design.md`
- 评审背景：基于当前 `review.md` 已新增“Review v4 已处理”说明后的再次复审

### 对旧问题修正情况的复核

- `Review v4` 的“部署模型措辞模糊”已被真正修正。文档现在明确写成“单部署单玩家”，并且把 `API Key` 配置方式统一到后端 `.env`，这两处表述已经一致，不再有多用户边界歧义。参考：[docs/specs/2026-03-23-zhaohua-design.md#L27](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L27) [docs/specs/2026-03-23-zhaohua-design.md#L99](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L99) [docs/specs/2026-03-23-zhaohua-design.md#L113](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L113)
- `Review v4` 的“粗粒度追算下叙事保真”并没有被修正，只是被下放到了实现计划阶段；但它直接影响“双主角切换后可回看对方轨迹”的产品承诺，因此仍然属于设计约束缺失，不是单纯实现细节。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92)
- `Review v4` 的“写锁超时恢复”也没有被修正。当前文档仍然只有“第二个标签页/设备等待锁释放后读取状态”的描述，没有把超时、失败提示、崩溃恢复这些运行时行为写出来。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94)
- “随机种子 / 可复现”同样没有真正闭环。文档只给了“事件池 + 触发条件 + 随机种子”的方向，但还没形成可编码、可验收的约束。参考：[docs/specs/2026-03-23-zhaohua-design.md#L101](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L101) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)

### 发现的问题

1. 这次改动没有再引入新的产品逻辑冲突，但引入了一个新的评审风险：把仍然影响用户体验和一致性的约束标记为“实现计划阶段细化”，会制造“问题已关闭”的假象，导致工程实现时每个人按自己的理解补规则。对于双主角回看、可复现和锁恢复，这种做法本身就是风险。参考：[docs/specs/2026-03-23-zhaohua-design.md#L11](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L11) [docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)

2. “离线超过 7 天后切天级追算”与“双主角切换后可看到对方在不操控期间做了什么”仍然没有可同时成立的最小规则。现在只写了“只计算每天的关键事件”，但没有定义哪些属于绝不能折叠的关键事件，因此这条承诺仍然无法验收。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L109](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L109) [docs/specs/2026-03-23-zhaohua-design.md#L110](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L110)

3. “保证可复现”与“并发访问等待写锁”现在都只有原则，没有协议。没有随机种子的派生规则、持久化位置、事件幂等键，也没有锁租约、超时、异常中断恢复路径；这会让追算结果是否一致、失败后如何恢复都无法被测试定义。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94) [docs/specs/2026-03-23-zhaohua-design.md#L101](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L101) [docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)

### 还缺的约束

- 需要定义粗粒度追算下“绝不能折叠”的最小事件集合，至少覆盖另一主角的关键行动、信件状态变化、长线故事阶段迁移；否则“双主角回看”只是文案承诺，不是系统能力。参考：[docs/specs/2026-03-23-zhaohua-design.md#L25](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L25) [docs/specs/2026-03-23-zhaohua-design.md#L92](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L92) [docs/specs/2026-03-23-zhaohua-design.md#L109](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L109) [docs/specs/2026-03-23-zhaohua-design.md#L110](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L110)
- 需要定义随机种子的派生单位、持久化位置，以及事件级幂等键 / 重放键；否则“保证可复现”无法落成测试用例或恢复机制。参考：[docs/specs/2026-03-23-zhaohua-design.md#L107](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L107) [docs/specs/2026-03-23-zhaohua-design.md#L198](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L198)
- 需要定义写锁的租约/等待上限、超时后的前端提示，以及异常退出后的恢复路径；否则并发访问只是在理想路径下串行，异常路径仍然悬空。参考：[docs/specs/2026-03-23-zhaohua-design.md#L94](/Users/zhenqiang/Documents/code/zhaohua/docs/specs/2026-03-23-zhaohua-design.md#L94)

### 结论

这次变更真正修掉的只有部署模型边界；`Review v4` 里其余几项并没有因为“留给实现计划阶段”就自动关闭。当前文档没有新增硬性产品矛盾，但仍缺少会直接决定用户体验、一致性和可验收性的核心约束，所以还不能把这些问题视为已处理完成。
