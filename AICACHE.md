# AI Cache / Agent Handoff Log

> 这个文件给 AI 编程代理和二开维护者使用，用来保存任务计划、执行日志、验证结果、风险点和交接信息。它的目标是防止断网、会话丢失、上下文被压缩后无法继续工作。

## 使用规则

- 开始多文件、架构、安全、发布、迁移类任务前，先新增或更新“当前任务”。
- 开发中按时间追加“执行日志”。
- 结束前必须更新“验证记录”和“交接说明”。
- 不要写入密钥、token、cookie、服务器密码、私有用户数据。
- 如果记录过期，直接标注“已完成/已废弃”，不要让后续 AI 误判。

## 当前任务

- 状态：in-progress
- 目标：生成 Linux amd64 本地集成测试包，合并验证 Komari PR #604、已合并访客审计 PR #602、komari-web PR #82 与 Glassmorphism v3.1.6 内置默认主题。
- 里程碑：M6 集成构建、测试交付与验证，不扩大现有上游 PR 范围。
- 范围：CGO Linux amd64 核心二进制、可导入主题 zip、独立管理端构建、测试说明与 SHA-256；部署后在用户保持登录的浏览器中继续联调。
- 安全约束：`visitor_audit_enabled` 保持上游默认关闭，由管理员在审计面板明确开启；测试包不预置数据库、账号、密钥或访客数据。
- 来源：Komari PR #604 `f08f47d`（含访客审计 PR #602）；komari-web PR #82 `0fee1f1`；主题基线 `261fcc1`，目标发布 v3.1.7。
- 不做：不把 Glassmorphism 默认主题替换混入计费 PR #604；不发布测试构建为正式 Release；不构建 Windows 包。

## 执行日志

### 2026-07-15 Linux integration test bundle

- 已确认 Komari PR #604 没有修改上游默认主题，但其提交历史已包含 PR #602 的访客审计 RPC、默认关闭开关、限流和日志过滤修复。
- 已确认 Glassmorphism `dist/` 包含由 komari-web `b8fcc4580fe2cd5b715b76c97f4ff4b9ba066581` 构建的完整 `/admin-app/`，入口桥接覆盖 `/admin`、`/terminal`、`/manage/*`。
- 用户指定只需 Linux 测试包；目标收窄为 `linux/amd64`。
- PR #604 复核修复：账单累计写入失败现在只记录日志，不再阻断已保存的 Agent 上报和运行时在线状态；新增回归测试，提交 `b242ee8` 已推送 PR 分支。流量费率明确为每 TiB（`1024^4 bytes`）。
- komari-web #82 本地补强：管理端账单弹窗新增流量、运行时间、首次开机费和总估算，30 秒刷新；费率前后端统一限制为 `0..1e12`；明确锚点可修改但首次上报后不可清空。`npm run lint` 为 0 error / 27 个既有 warning，`npm run build` 通过。
- v3.1.6 空白页已稳定复现：`HomeView` 新增 `PingMonitorDialog` 时把弹窗放在主根节点外，视图变成 Fragment；Vue 报 `Component inside <Transition> renders non-element root node`，`out-in` 离场后主区域为空。修复为把弹窗移入 `.home-view` 单一根容器；浏览器首页 -> 详情 -> 返回首页恢复正常且无新 warning/error。
- 永久约束已写入 `AIAGENTREADME.md` 和 `src/AGENTS.md`：路由视图必须单元素根，新增全局弹窗后必须验证动画开启/关闭两种路由往返。

### 2026-07-15 v3.1.6 release preparation

- 默认主题后台：完整 komari-web 已从 `b8fcc4580fe2cd5b715b76c97f4ff4b9ba066581` 重新构建并同步到 `public/admin-app/`；旧主控不返回 `traffic_rate` 时隐藏且不提交新增计费字段。komari-web PR #82 为 open、clean、mergeable。
- 实时费用上游：Komari PR #604 为 open、clean、mergeable；`build-frontend` 和 Linux/Windows 386、amd64、arm64、riscv64 共 8 个构建任务全部成功。字段覆盖流量单价、小时单价、一次性首次开机费、首次 Agent 上报锚点和持久累计流量。
- 主题功能：节点卡/列表延迟与丢包可打开完整 Ping 图；剩余价值可打开逐节点费用、币种和汇率明细；访客审计增加开关、UTF-8 字节截断及完整 JSON/CSV 导出；默认背景替换为原创青蓝/淡紫/薄荷网格图。
- 背景资产：`public/images/default-background-v2.webp` 与 `output/imagegen/default-background-v2.webp` 均为 2048x1152、32,436 bytes、SHA-256 `42377961822666817def3d3b51b2c236a0f5f631dd1475535d9438a6b7ac551b`；仅使用本地 Lanczos 放大修正画布，未再次调用图像 API。
- 代码复核：修复费用明细把“未设置到期时间”误显示为“今天”的问题；空费率和空开机费按 0，开机费只有存在首次成功上报锚点才计入；汇率保持“1 CNY 对应目标币种”的既有换算方向；旧核心能力检测通过。
- 验证：`bun run lint`、`bun run type-check`、`bun run build` 和产品源码 diff check 全部通过。浏览器验证桌面无横向溢出；价值弹窗 1280x720 下为 1024x525，390x844 下为 358x687 且表格滚动不溢出；`/admin` 恢复原 URL、完整菜单和 `glass-admin.css` 正常加载。
- 本地包：`komari-theme-Glassmorphism-build-e3abeff.zip`，7,606,509 bytes，SHA-256 `7539c1ef6ba8d65391215d04075256e59957e1b3af758832c72841412c17632b`；770 个条目，顶层为 `komari-theme.json`、`preview.png`、`dist/`，包内版本 3.1.6，`dist/admin-app/` 419 个条目且无 PWA/Service Worker 文件。
- 发布完成：提交 `c368669ec10468a026991e21556ee3e34d5c99a0` 已推送 main；Release On Version Bump run `#29420879366`（#54）成功；annotated tag `v3.1.6`、Release target 与 main 均指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-c368669.zip`，7,615,774 bytes，GitHub digest / 下载后 SHA-256 均为 `c9495a97e754512103fb0bb38a528ea27a31c3e02888cf18b796fd7a6985f3ae`；下载复核版本 3.1.6、770 个条目、419 个后台条目、顶层契约和无 PWA/Service Worker 文件均正确。
- 发布边界：`.claude/` 和 `output/` 未进入发布提交；版本唯一来源保持 `komari-theme.json` 的 3.1.6。

### 2026-07-15 default-theme integration review follow-up

- 正在复核已有 admin-app 路由桥接、PWA 作用域、同步可重复性，以及 v3.1.5 色觉友好 / 访客审计与 Komari PR #602 合并代码的真实契约。
- 已确认 `/admin`、`/terminal`、`/manage/*` 通过独立静态子应用恢复原 URL 的方案可行；公开主题主包不会加载 React 管理端 chunk。
- 已发现并修复：浏览器禁用 sessionStorage 时入口不跳转；桥接架构下官方 `/admin-app/` Service Worker 无法覆盖恢复后的真实路由却可能保留旧后台资源；同步脚本缺少上游 HTML 结构断言。
- 真实后端联调发现 Vite 代理只改 Host、未改 HTTP Origin，Komari 默认来源校验会拒绝本地 RPC；开发代理现统一把 `/api`、`/themes` Origin 设为 `VITE_API_TARGET`，WebSocket 继续使用 `rewriteWsOrigin`。
- 访客审计补强：详情限额改按 UTF-8 字节计算，超限优先保留会话、站点指纹和 WebRTC 摘要；审计面板增加 `visitor_audit_enabled` 管理员开关，复用 `admin:editSettings` 的部分更新契约。

### 2026-07-15 complete default-theme admin integration

- 已核对 Komari `web/public/public.go`：`/admin` 和 `/terminal` 强制使用 embedded defaultTheme，静态文件会在当前主题缺失时回退 embedded defaultTheme。
- 已从官方 `komari-monitor/komari-web` 提交 `ebfbd3e079f8777a746276fe67429b519024f7c7` 完整构建 415 个 PWA 预缓存文件，并同步到 `public/admin-app/`。
- 已加入根入口路由桥接和 admin-app URL 恢复，BrowserRouter 在 `/admin/...`、`/terminal`、`/manage/*` 下保留原路径语义。
- 已加入 Glassmorphism 亮暗色 CSS 覆盖，不改官方 React 功能代码；后台菜单已在浏览器确认包含站点、主题、登录、通知、XtermJS、监控数据库、远程执行、Ping、会话、账户和日志等完整模块。
- 已新增 `bun run sync:admin -- <komari-web-path>`，可从新的官方 checkout 重建并记录来源提交。
- 已为主题 Vite 开发服务器补 `/api`、`/themes` 代理，默认指向 `http://127.0.0.1:25774`，可用 `VITE_API_TARGET` 覆盖。
- 最终校验：`bun run lint` 和 `bun run build` 均通过；生成 `komari-theme-Glassmorphism-build-e3abeff.zip`（7,573,457 bytes、770 个条目），关键管理模块与来源记录均已核对。浏览器已确认 `/admin` 完整菜单和 Glassmorphism 亮暗色覆盖；本地未启动 Komari 后端，因此未进行登录后的 API 写操作验证。

## 上一任务

- 状态：done
- 目标：新增可选的色觉友好配色，提前适配 Komari PR #602 的访客审计上报与日志查看能力，并发布 `v3.1.5`。
- 里程碑：主类 M5 新功能；色觉友好界面属于 M4，访客审计的数据最小化、权限和隐私边界按 M3 执行。
- 范围：主题托管设置、语义色与图表/Ping 色板；`visitor_audit_enabled` 能力检测；公开访客事件上报、站点隔离安全指纹与操作埋点；AuditLogPanel 的 visitor 过滤、解析和结构化展示；版本/README、构建、推送和 GitHub Release 全流程。
- 计划：色觉友好 token/色板 -> 访客审计 RPC/service/composable -> 安全指纹与页面操作埋点 -> 审计面板 visitor 视图 -> lint/build/浏览器验证 -> v3.1.5 版本/说明 -> zip/Actions/Release/线上资产验证。
- 不做：不记录密码、token、Cookie、query value、完整搜索词、WebSSH/剪贴板内容；不上传原始 WebRTC ICE 地址，不调用第三方 STUN，不采集设备 ID、Canvas 或音频指纹；不在核心 `1.2.6` 缺少能力时发送未知 RPC；不改 `package.json.version`，不提交 `.claude/`。

## 执行日志

### 2026-07-15 color-vision-friendly palette / visitor audit preparation

- 参考结论：色觉友好模式不能只换红绿色；需要拉开明度/饱和度，使用朱红、蓝绿、蓝、橙、紫红等安全色，并让重要状态同时具备文字、图标、形状或线型差异。
- 上游状态：Komari PR #602 已于 2026-07-15 合并，head `0c80f0f`、merge commit `5fa59ab`；PR CI run `29389802493` 成功。当前最新正式 Release 仍为 `1.2.6`（2026-07-12），所以主题只能提前适配并通过公开设置字段做能力检测。
- 上游契约：`public:recordVisitorEvent` 只接收 `event/path/route/target/detail`；IP、User-Agent、登录 UUID 和时间由服务端可信记录；`visitor_audit_enabled` 默认 false；每 IP 30 次/分钟、burst 10；`admin:getLogs` 新增 SQL 级 `msg_type` 精确过滤。
- 指纹决策：在核心开关明确启用后，记录随机 session ID、浏览器/系统能力、时区语言、屏幕/硬件摘要、自动化标记和含当前 origin 的 SHA-256 站点隔离指纹；WebRTC 仅使用本地 ICE gathering，保存候选类型/协议/地址类别和站点隔离哈希，不保存原始候选或地址，不调用第三方 STUN。
- 发布目标：功能完成并确认无明显逻辑漏洞后更新唯一版本源和 README 到 `v3.1.5`，执行 lint/build/zip 检查，推送 main 并核验 GitHub Actions、Release 和线上包。
- 已实现：主题设置新增标准 / 色觉友好模式；语义状态色、Ping 分级纹理和多任务图表虚实线同步切换，亮暗色关键前景组合对比度均高于 4.5:1。
- 已实现：按 PR #602 契约接入 `visitor_audit_enabled`、`public:recordVisitorEvent` 和 `admin:getLogs.msg_type`；旧核心缺少能力字段时不发送新 RPC。
- 已实现：页面、节点、分组、搜索长度、快捷筛选、视图、后台入口、工具、快照与审计导出等事件；首次页面事件附带站点隔离会话、稳定浏览器指纹及语言、时区、屏幕、硬件、自动化、WebGL、WebRTC 哈希摘要。
- 已实现：AuditLogPanel 新增访客视图和结构化 IP / UA / 身份 / 会话 / 指纹展示；JSON / CSV 导出拉取当前服务端筛选的完整分页数据，包含去重/旧核心分页保护，CSV 沿用公式注入防护和 UTF-8 BOM。
- 安全复核：不提交查询值、完整搜索词、密码、Cookie/Token、命令、剪贴板、原始 ICE candidate 或原始局域网地址；WebRTC 不使用第三方 STUN，只保存站点隔离哈希与候选类型摘要。
- 本地验证：`bun run lint` 通过；`bun run build`（含 `vue-tsc --build`）通过；访客消息解析 / Chrome Windows UA 样例通过；色觉语义前景对比度为 5.19-8.21:1；桌面浏览器渲染无新增重叠。移动窄视口自动化被浏览器安全策略阻止，已改做响应式模板与生产 CSS 静态复核。
- 最终本地验证：rebase 到远端 `2183a48` 后，`bun run lint`、`bun run build`、`git diff --check` 再次通过；发布提交 `af32f25`；本地包 `komari-theme-Glassmorphism-build-af32f25.zip` 大小 5,114,116 bytes，SHA-256 `098c3882b5b4b576912e23157f8ca59ddc771f900c152882c651336db2adb28c`，顶层为 `komari-theme.json`、`preview.png`、`dist/`，包内版本 `3.1.5`，345 个 dist entries。
- 远端验证：发布提交 `af32f25f90f9e9c5b52e7b8885a2c0787b827f0c` 已推送 `main`；GitHub Actions `Release On Version Bump` run `#29397249147`（#52）成功；tag `v3.1.5` 与正式 Release 均指向该完整提交。
- 线上资产：`komari-theme-Glassmorphism-build-af32f25.zip`，大小 5,129,174 bytes，GitHub digest / 下载后 SHA-256 均为 `45e71e7d82bb6caf8d36625bbee8e069b71270eba5f9f475086560b7c6b41d9d`；下载复核顶层结构、包内 `3.1.5`、预览图和 345 个 dist entries 均符合发布契约。

### 2026-07-14 v3.1.4 Issue #18 per-bucket Ping loss fix

- Issue 判断：应修复。Komari 1.2.6 的 `public:queryMetrics` 已返回 `ping.loss` 分时序列，当前主题只查询 `ping.latency`，再把 `avgLoss` 覆盖到每个历史格，导致所有格子同值同色。
- 修复边界：周期汇总继续采用 `public:getPingMetricStats` 的按样本加权平均；历史时间格改为消费 `ping.loss`，按时间桶与 point `count` 加权，ratio 转百分比；`null` 保持空桶；旧 records 负值丢包逻辑保持不变。
- 已实现：Metric Store 查询同时请求 `ping.latency_ms` / `ping.loss`；按任务与时间桶聚合 loss point，使用 `count` 加权；丢包序列覆盖不完整时回退 legacy records；本地 Ping 缓存版本升到 8，避免旧错误结果继续命中。
- 发布准备：唯一版本源更新为 `3.1.4`，README 当前版本、专项说明与更新日志已同步；`.claude/` 继续排除。`gh` 登录 token 已失效，本次公开 Issue / Actions / Release 核验改用 GitHub REST，git 推送凭据正常。
- 本地验证：`bun run lint`、`bun run build` 和 `git diff --check` 均通过；构建仅有既有 `@vueuse/core` PURE 注释与 `globe` 大 chunk 警告。
- 本地资产：`komari-theme-Glassmorphism-build-4f37416.zip`，大小 5,105,926 bytes，SHA-256 `3b9510345ad79319d70311ed8a3c03a79cf4159cbf5b0ef48c3f04623798df74`；顶层为 `komari-theme.json`、`preview.png`、`dist/`，包内版本为 `3.1.4`。
- 远端验证：发布提交 `91c9b06` 已推送 `main`；GitHub Actions `Release On Version Bump` run `#29312369165`（#49）成功；tag `v3.1.4` 指向完整提交 `91c9b06fc5c4b5ee2636dc18779861186806abd7`；Release 为正式发布（非 draft / prerelease）；Issue #18 已由 `Fixes #18` 自动关闭为 completed。
- 线上资产：`komari-theme-Glassmorphism-build-91c9b06.zip`，大小 5,114,852 bytes，SHA-256 `f8b4c9b6f61cc66d755d7a612357d16d1d2774f9494b9b0c3ce87e572ee5da9b`；下载复核顶层结构为 `komari-theme.json`、`preview.png`、`dist/`（344 个 dist entries），包内版本为 `3.1.4`。

### 2026-07-14 v3.1.3 reduced-motion route transition fix

- 线上复现：`tz.yisaw.com` 开启减弱过渡动画时，点击节点后 URL 已进入详情但 `<main>` 为空；`km.ydao.de` 使用同一构建且未触发配置时，详情和返回首页均正常。
- 根因：路由 `Transition` 在 `css=false` 时仍使用 `mode="out-in"`；同步离场的 `afterLeave` 与 `KeepAlive` 更新重入后，Vue 访问空 DOM 锚点并抛出 `nextSibling` / `parentNode`。
- 修复：减弱动画时路由 Transition 改用默认并行模式；正常动画继续使用 `out-in`，首页缓存策略保持不变。
- 发布准备：唯一版本源更新为 `3.1.3`，README 当前版本、专项说明和更新日志已同步；`.claude/` 继续排除。
- 本地验证：`bun run lint`、`bun run build` 和 `git diff --check` 均通过；构建仅有既有 `@vueuse/core` PURE 注释与 `globe` 大 chunk 警告。
- 本地资产：`komari-theme-Glassmorphism-build-4716f15.zip`，大小 5,105,653 bytes，SHA-256 `e202ce28508a3dc0c9b1a4a1e8c5c7706dd1f281ef72d8f4d73d429b891bac11`；顶层为 `komari-theme.json`、`preview.png`、`dist/`，包内版本为 `3.1.3`。
- 远端验证：提交 `4f37416` 已推送到 `main`；GitHub Actions `Release On Version Bump` run `#29311122789` 成功；tag `v3.1.3` 已生成；Release 为正式发布（非 draft / prerelease）。
- 线上资产：`komari-theme-Glassmorphism-build-4f37416.zip`，大小 5,120,783 bytes，SHA-256 `f4d5f1be0c769ffc5372ab6a9b780042768f82529827b7222a843ef642605bee`；下载后复核顶层结构为 `komari-theme.json`、`preview.png`、`dist/`，包内版本为 `3.1.3`。

### 2026-07-14 post-release README restructure

- 按用户提供的发帖结构重写 README：突出 `v3.1.2` 启动自愈，并重新组织详情指标、自定义、Metric / Ping、首页、高级工具、架构、安全、WebKit / Firefox 兼容和安装说明。
- 事实边界：普通 Load / Ping 历史继续公开；敏感高级工具、Geo、导出和磁盘预测保持登录校验；Safari 15.4 是构建基础边界，Tailwind CSS v4 完整视觉基线仍为 Safari 16.4+。
- 本轮仅计划提交 `README.md` 与 `AICACHE.md`；主题版本继续保持 `3.1.2`。
- 验证：`bun run lint` 通过；`git diff --check` 通过；lint 后差异仍只有两个 Markdown 文件，`komari-theme.json` 和运行时代码均未修改。

### 2026-07-14 startup single-point-of-failure fix

- 已确认根因：`InitManager.init()` 串行等待 `healthCheck()`，首次 Ping 失败会阻止 public settings、用户、节点数据和实时连接启动；`connectionError` 仅在首页渲染，详情路由缺少故障反馈。
- 设计：健康检查使用已有 5 秒配置并增加 3 次递增间隔重试；四个启动请求通过 `Promise.allSettled()` 隔离；节点首拉失败仍启动轮询自动恢复；显式重试复用现有 manager，避免重复定时器和 WebSocket 监听。
- 已实现：RPC Ping 支持 AbortSignal；健康检查超时会取消底层请求；初始化改为独立并行；全局 app shell 显示连接错误和重试状态，首页重复提示已移除。
- 首轮验证：`bun run lint`、`bun run build` 通过，生成 `komari-theme-Glassmorphism-build-bb52e94.zip`；仅有既有 `@vueuse/core` PURE 注释提示和 `globe` chunk 体积警告。
- 浏览器验证：首页和直接进入 `/instance/missing-node` 都显示全局连接错误；1270px 和 390x844 无横向溢出或按钮/文案重叠；重试按钮会进入禁用的“重试中”状态，失败后恢复。
- 快速复查：未发现新的发布阻断 bug；Firefox 毛玻璃回退、列表虚拟化、共享 Ping/负载缓存已存在。后续高收益专项候选为卡片模式 30+ 节点全量挂载，以及约 2.98 MB 地球纹理和 1.98 MB `globe` chunk 的传输/解析成本。
- 发布准备：`komari-theme.json.version` 已更新为 `3.1.2`，README 当前版本与更新日志已同步。
- 最终验证：版本更新后 `bun run lint`、`bun run build` 通过，生成 `komari-theme-Glassmorphism-build-bb52e94.zip`；zip 顶层契约为 `komari-theme.json`、`preview.png`、`dist/`，包内版本为 `3.1.2`。构建仍仅有既有 `@vueuse/core` PURE 注释和 `globe` 大 chunk 警告。
- 已发布：提交 `aed8626` 已推送到 `main`；GitHub Actions `Release On Version Bump` run `#29305550352` 成功；tag `v3.1.2` 指向该提交，Release 为正式发布（非 draft / prerelease）。
- 线上资产：`komari-theme-Glassmorphism-build-aed8626.zip`，大小 5,114,600 bytes，SHA-256 `71155874add7df49ee0cbe14b403f5d959767e754ffbe21b0a8259c6bf7014d9`；下载后复核顶层结构与包内 `3.1.2` 版本均符合契约。

### 2026-07-14 v3.1.1 release preparation

- 已将唯一版本源 `komari-theme.json.version` 更新为 `3.1.1`，README 当前版本与更新日志同步。
- 发布前 `bun run lint`、`bun run build` 和 zip 清单检查通过；本地 zip 内版本为 `3.1.1`，顶层包含 `komari-theme.json`、`preview.png`、`dist/`。
- `.claude/` 为本机配置，继续排除；远端 `91f46ac` 仅修改 README 赞助名单，将在发布提交后 rebase 合入。

### 2026-07-14 v3.1.0 background/list/Ping regression quick fix

- 修复默认背景被 `body` 实色层遮挡：页面可见背景统一由 `Background.vue` 负责，`html` 继续提供无 JS/加载失败时的底色。
- 列表模式小 Ping 条移除每行 40 个绝对定位气泡，改用原生提示，避免气泡压住运行时间，同时降低列表 DOM/hover 合成开销。
- 首页快捷控制计数改为直接计数；月成本、流量、上下行、峰值等只显示数量的入口不再每轮实时更新重复排序全部节点。
- 普通节点 Ping 延迟/丢包恢复公开访问，移除 `historyMetrics` 登录权限；高级工具、Geo、导出、审计和磁盘预测权限保持不变，相关开发文档已同步。
- Ping 详情请求增加序列保护，快速切换时间范围/节点时旧请求不再覆盖新结果；时间锚点合并从遍历全部历史锚点改为只回看最近候选，避免大样本下退化为 O(n²)。
- 验证：`bun run lint` 通过；`bun run build` 通过并生成 `komari-theme-Glassmorphism-build-771c363.zip`。仍有既有 `@vueuse/core` PURE 注释提示和 `globe` chunk 体积警告。
- 暂不扩展：按用户要求放弃全量审查；卡片模式全量挂载、首页小 Ping 按节点请求仍可作为后续性能优化项。

### 2026-07-14 v3.1.0 release

- 已将 `komari-theme.json.version` 更新为 `3.1.0`；README 补齐 25 个 definition、12 个图表族、详情预设、Ping 自定义时间与丢包修复，并新增 v3.1.0 更新日志。
- `.claude/settings.local.json` 为本机配置，明确排除在发布提交之外；其余当前产品代码、适配文档和新增图表组件纳入本次 release。
- 发布前 `bun run lint`、`bun run build` 与 zip 清单检查通过；本地包内版本为 `3.1.0`，顶层包含 `komari-theme.json`、`preview.png`、`dist/`。构建仍只有既有 `@vueuse/core` PURE 注释和 `globe` chunk 体积警告。
- 已提交并推送 `main`：commit `14dac71`。GitHub Actions `Release On Version Bump` run `#42`（ID `29268363931`）成功；tag `v3.1.0` 指向该提交，Release 已发布，资产为 `komari-theme-Glassmorphism-build-14dac71.zip`（5,120,319 bytes，SHA-256 `6ecfccecf9e434da554ccea794123247c48646e9b64ba94910e697888843115c`）。

### 2026-07-14 official detail metric dashboard expansion

- 已实测公开节点详情页 `mt.vpnmiao.com`：官方默认将 CPU+Load、RAM+Swap、实时网络+累计流量、Ping 多任务合并成卡，支持 S/M/L、增删指标和拖拽；新增菜单来自 `public:listMetricDefinitions`。
- 已核对 RPC 文档与 Komari 1.2.6 `c828653`：后端固定创建 25 个定义；GPU 设备序列带 `device_index/device_name`，Ping 序列带 `task_id`；`ping.loss` 写入值为 0/1，聚合后按比例显示；`public:queryMetrics` 的空桶是 `null`。
- 设计决策：主题设置提供 12 个稳定指标族和多套预设，覆盖全部官方指标但避免 25 张单指标碎卡；保留原有独立 PingChart，LoadChart 中的 Ping 卡为可选紧凑总览。
- 已完成 25 个 definition 到 12 个图表族的查询、展示和预设映射；统一图标头部，并校验 Iconify 图标资源。GPU、显存、温度、流量、Ping 延迟和 Ping 丢包按 definition/数据存在性自动显示。
- 按用户反馈将详情概览恢复为宽屏 4 列、中屏 3 列、移动端 2 列，预设调整为 8/12/16 张；独立 Ping 图新增精确起止时间，新 metric API 传 `start/end`，无有效时序点时回落 legacy 并按保留窗口回溯后裁剪，legacy 仍以 `value < 0` 识别丢包。
- 丢包兼容补强：PingChart 只有 latency series 对应任务同时具备非 approximate loss stats 才采用新路径，否则整体回落旧 records；首页 Ping 汇总不再过滤 100% 丢包任务，metric loss 按 `total` 加权，loss stats 缺失/估算时回落 legacy。旧接口的负值哨兵判断保持不变。

### 2026-07-13 Komari 1.2.6 configurable card adaptation

- 已核对官方 `komari-web` `radix` 分支提交 `ebfbd3e` 与 Komari 1.2.6 tag 提交 `c828653`。官方公开页仍为首页与节点详情两页；首页有当前时间、在线节点、地区、总流量、实时网速 5 类状态卡，详情页使用 Metric Store 展示 CPU、内存、硬盘、网络、GPU、连接、进程与 Ping 指标。
- 差集结论：本地主题已覆盖并扩展大部分公开监控能力，但详情概览和图表排序缺少直观配置；本轮以 `/instance/` 为重点，并补齐官方时间卡与新版探针 GPU 总览。
- `InstanceDetail.vue` 已接入 18 类可配置概览卡：价格/月成本/到期/剩余价值、CPU/GPU/内存/Swap/磁盘、负载/温度/进程/连接/运行时间、上下行速率/总流量/流量额度。默认财务预设保持原有视觉行为。
- `app.ts` 已新增详情概览和图表预设及配置兼容。图表提供 all/compact/resource/network/gpu/custom 公开预设，并继续兼容旧独立卡位、advanced 值和 `chartDashboardTemplate` JSON/逗号列表。
- `komari-theme.json` 已把设置重组到 8 个编号区段；后续按用户反馈移除 23 个逐项下拉卡位，收缩为 48 个唯一设置 key，并压短易溢出的 help。主页、详情概览、详情图表分别使用一个英文逗号 keys 字段；打包预览字段为发布契约要求的 `preview.png`。
- `index.html`、`main.css` 和 `vite.config.ts` 已增加旧 WebKit 兼容边界：构建目标 Safari 15.4，缺少 `oklch` / `color-mix` 时切换 sRGB token 并关闭毛玻璃，无 ESM 时显示可读升级提示。Tailwind CSS v4 的正式浏览器基线仍是 Safari 16.4+。
- Ping 诊断结论：legacy `value < 0` 是 Komari 1.2.6 的历史丢包哨兵，不能直接删除；后续应修复 100% 丢包任务被过滤、不同样本量按任务等权平均，以及新接口只有延迟序列但缺少 loss stats 时未整体 fallback 的低报风险。本轮未改 Ping 语义。
- 设置紧凑化 follow-up：5 个 key 列表改为 `richtext` 多行输入，`parseKeyList()` 统一接受英文/中文逗号、分号、空格和换行；help 补全每个英文 key 的中文含义，并用映射间空格保证官方后台可换行。详情概览从桌面 4 列改为 3 列，财务/状态/网络/GPU 预设各 6 卡、资源 9 卡、综合 12 卡；同时修复自定义头部白名单遗漏 `monthlyCost`。
- 安全边界：后台 Metric Store 配置/迁移、数据库维护、通知、Agent 管理、命令执行和终端继续使用 Komari 官方后台，不进入公开主题路由。

### 2026-07-13 light-mode flash and home reveal follow-up

- 开始按用户“亮色模式还是太闪，刷新和显示主页没有过渡”的反馈做第二轮视觉修复：本轮不改启动数据流，重点降低 light mode 首屏/token/loading/默认背景亮度，并软化 loading -> app shell -> HomeView 的显示过渡。
- 已更新 `src/styles/main.css`、`src/utils/glassTheme.ts`、`src/stores/app.ts`、`komari-theme.json`：亮色根背景、卡片/弹层 token、默认毛玻璃 preset、自定义默认色和 Firefox fallback 均从纯白/高白度改成灰蓝雾面，降低浏览器第一帧和 fallback 合成时的亮度。
- 已更新 `src/components/Background.vue`：自定义图片预加载期间继续显示柔和默认背景兜底；默认亮色背景与视频 loading/fallback 改为低亮灰蓝渐变，并降低 emerald/lime spotlight 亮度。
- 已更新 `src/components/LoadingCover.vue`、`src/components/Provider.vue`、`src/App.vue`、`src/views/HomeView.vue`：LoadingCover 亮色普通遮罩改为低亮渐变；body 仅在存在当前背景 URL 时透明；loading/app shell/router 过渡改为更柔和的 200–300ms opacity/微位移，router transition 遵守 `disablePageAnimation`；首页容器增加轻量 reveal 且 reduced-motion 下关闭。

### 2026-07-13 home refresh flash fix

- 开始修复用户反馈的首页强闪屏：参考 vlongx 主题的稳定首屏/非白色加载策略，采用低风险首屏主题预设 + token 化加载遮罩 + 密集节点卡片禁用首轮动画方案。
- 决策：先解决高置信视觉闪屏根因，不引入卡片虚拟滚动或 Ping 聚合重构，避免扩大数据层和布局风险。
- 已更新 `index.html`：在首屏前按本机 `themeMode` 或北京日夜 fallback 预设 `.dark` 和 `colorScheme`，异常时默认暗色，避免夜间白屏。
- 已更新 `src/styles/main.css` 与 `src/components/LoadingCover.vue`：初始文档背景使用 token；加载遮罩使用 `--color-background` + `color-mix` 半透明背景，并保留纯 token fallback。
- 修复用户反馈的自定义背景图片失效：根因是 `#app` 被首屏防闪屏补丁设置为不透明 `background-color: var(--color-background)`，而 `Background.vue` 的 fixed 背景层在 `z-index: -1`，因此被 `#app` 自身背景盖住；已移除 `#app` 背景，仅保留 `body` 初始 token 背景。
- 继续修复刷新时仍能看到白雾 Loading 的反馈：`LoadingCover.vue` 现在读取归一化背景配置，自定义背景启用且当前模式有背景 URL 时，加载覆盖层不再铺 `color-mix(... 82%)` 半透明背景，也不再显示 `Loading...` 文案，只保留轻量圆形指示器，避免把背景洗白。随后进一步移除 `App.vue` LoadingCover 外层 Transition 的 `backdrop-blur-sm` enter/leave class，并去掉自定义背景加载指示器自身的小块 `backdrop-filter`；最新调整将自定义背景加载遮罩改为极低透明深色层、普通加载层改为低对比灰蓝/深色层，并让图片背景预加载阶段不显示纯白 token 占位，避免任何 loading 阶段继续出现高亮白雾。
- 已更新 `src/constants/ui.ts`、`src/views/HomeView.vue`、`src/components/NodeCard.vue`：30+ 卡片节点禁用首轮卡片切换 CSS 动画，60+ 卡片节点禁用在线状态扩散环，普通节点数量仍保留原动画。
- 修复首页延迟/丢包与详情页不一致：`useNodePingStats.ts` 的 metric series 路径此前把 `queryMetrics(fill_empty: true)` 返回的 `null` 点转成 `-1` 并计入丢包，导致首页卡片显示明显丢包；详情页图表会把同类 null 当断点，所以看不到丢包。现改为 metric series 只用于有效延迟点，丢包摘要优先读取 `public:getPingMetricStats` 的非估算 `loss`，`loss_approximate` 时不参与首页平均丢包；详情页 `PingChart.vue` 也同步忽略 metric null 点。
- 首页小卡延迟/丢包采样显示按用户反馈恢复为等高整条颜色分级，不再按高度变化。旧接口 fallback 仍保留：只有 `public:getPingMetricStats` / `public:queryMetrics` 不可用或无数据时，才走 legacy `common:getRecords`，并继续按旧接口的 `value < 0` 记录计算丢包。

### 2026-07-13 chunk/request pressure follow-up

- 开始修复历史详情页加载时请求爆炸放大因素：将 v3 共享服务/工具模块纳入 Vite manual chunk，并让 LoadChart legacy fallback 与详情页 24h 统计使用同一个 `LOAD_RECORD_MAX_COUNT` cache/request 维度。
- 已更新 `vite.config.ts`：新增 `v3-services` manual chunk，合并 history/metrics/request/cache service 与 osImageHelper/metricSeries/useNodePingDisplay 等跨异步组件共享模块，减少 Rollup 自动拆出的零散共享 chunk。
- 已更新 `src/components/LoadChart.vue`：legacy fallback 调用 `loadNodeLoadRecords(props.uuid, hours, LOAD_RECORD_MAX_COUNT)`，与 `InstanceDetail.vue` 的 24h 峰值统计保持同一 `maxCount` 维度以复用 cache/request key。
- 发布前同步 `origin/main`（包含 README 更新提交 `94691f1`），并将 `komari-theme.json.version` 从 `3.0.2` bump 到 `3.0.3`，避免已有 `v3.0.2` tag 导致 release workflow 跳过。

### 2026-07-13 v3.0.0 frontend follow-up

- 开始补完用户复查指出的 4 项：物理核心参与每核成本并展示到 NodeCard、LoadChart 增加 start/end 自定义时间范围、metric definitions 加 TTL 结果缓存、修复 `SharedCache.retain()` 覆盖后 release 引用计数孤儿化。
- 约束：保持 v3.0.0 版本号和发布结构不变；自定义范围在 metric API 可用时精确传 `start` / `end`，旧后端 fallback 只做近 N 小时近似。
- 已实现 AuditLogPanel：`admin:getLogs` RPC 类型和方法、`audit.service.ts` request key 去重、`auditLog` 权限 key、首页第 5 个高级工具入口、只读表格和分页；`limit` / `page` 调用时按官方文档转为 string。
- 已实现磁盘预测体验补充：`prediction.service.ts` 新增 `analyzeDiskPrediction()` 返回不可用原因，NodeCard / HealthSummaryPanel 在样本不足或历史不足 2 天时显示“数据积累中”；NodeCard 调 `useNodeLoadStats` 时显式传 `LOAD_RECORD_MAX_COUNT`，避免未传 `maxCount` 走后端默认配额时体验不稳定。

### 2026-07-13 official metric-store feature port

- 开始实施官方 komari-web 高价值功能移植第一批：新增 metric series 工具、metrics service、Ping metric 优先路径与节点 `message` 提示；保持旧版 `common:getRecords` fallback，不改发布结构和版本。
- 已新增 `src/utils/metricSeries.ts` 与 `src/services/metrics.service.ts`，封装 metric tags/series 拆分、Ping task/stat helper、EWMA 平滑工具，以及 `public:listMetricDefinitions` / `public:queryMetrics` / `public:getPingMetricStats` / `public:getPublicPingTasks` 服务层请求。
- 已改 `src/composables/useNodePingStats.ts` 与 `src/components/PingChart.vue`：优先并发尝试 Ping metric stats 和 metric series；新接口失败或空数据时回退 legacy Ping records；Ping 图表信息卡补充 stddev、valid、loss approximate 等官方统计字段。
- 已改 `src/components/NodeCard.vue` 与 `src/components/NodeList.vue`：节点名旁展示 `message` warning 图标，tooltip 纯文本/换行显示 message 与 `status_updated_at`，不使用 `v-html`。
- 已运行 `bun run lint` 与 `bun run build`，均通过；构建生成 `dist/` 和 `komari-theme-Glassmorphism-build-881385d.zip`。
- 继续按用户“全部上马”要求实施剩余官方功能：LoadChart 历史模式优先 metric store、GPU detail/per-device metric 图表、`chartDashboardTemplate` 托管配置读取与布局排序。
- 已改 `src/components/LoadChart.vue`：非实时历史数据优先通过 `public:listMetricDefinitions` 过滤可用指标，再调用 `public:queryMetrics` 查询 `cpu.usage`、`load.average`、memory/swap/disk/net/connections/process/GPU 等指标并转换为当前 ECharts 数据；无定义、无数据或失败时回退 `loadNodeLoadRecords()` legacy 路径。实时模式仍保留 `common:getNodeRecentStatus`。
- 已补 GPU 兼容：`src/utils/rpc.ts` 增加 live/history GPU detail 类型；LoadChart 支持 `gpu.usage`、`gpu.device.usage`、`gpu.memory.used`、`gpu.memory.total`、`gpu.temperature`，按 `device_name` / `device_index` 汇总 tooltip，并在存在 GPU 数据时显示 GPU 卡片。
- 已接入 `chartDashboardTemplate`：`komari-theme.json` 增加托管配置项；`src/stores/app.ts` 安全解析 JSON / 逗号列表并暴露 `chartDashboardTemplate`；LoadChart 按 cards 顺序渲染 cpu/memory/disk/network/gpu/connections/process，非法配置自动回默认。
- 全量移植验证：第一次 `bun run lint && bun run build` 因 LoadChart `chartData` 在 `hasGpuData` 前置引用触发 `ts/no-use-before-define` 失败；移动 computed 后第二次 build 因 `parseChartDashboardTemplate` 局部变量类型推断为窄类型失败；显式标注 `let value: unknown` 后重跑 `bun run lint && bun run build` 通过。
- 按用户要求压缩主题设置：`glassCustomColors` 合并原 10 个自定义颜色字段，help 文案列出可用 key；`app.ts` 支持新 JSON 配置并兼容旧字段。按用户补充要求增加 `gpuChartEnabled` 开关，默认关闭，LoadChart 只有开关开启且有 GPU 数据才显示 GPU 卡片。

### 2026-07-12 Komari 1.2.x compatibility adaptation

- 已调研官方 `komari.wiki` / `komari-document.pages.dev` 的 RPC、API、theme、agent 文档，以及 `komari-monitor/komari`、`komari-web`、`komari-agent`、`komari-document` 官方仓库/release。
- 决策：主题打包结构保持 `komari-theme.json` + `preview.png` + `dist/` 不变；适配重点放在数据层兼容。
- 开始实施第一批兼容补丁：RPC 参数/类型、历史 records 返回形态、新探针字段、public RPC 方法壳。
- 已完成第一批兼容补丁：`src/utils/rpc.ts` 新增 Komari 1.2.x public RPC/metric 类型与方法壳，并让 `common:getRecords` 同时发送 `maxCount` 与 `max_count`；`src/services/history.service.ts` 兼容 records array/map 返回；`src/utils/api.ts`、`src/stores/nodes.ts`、`src/views/InstanceDetail.vue` 补充新探针字段与物理核心展示。
- 验证中首次 `bun run build` 因 `MetricQueryParams` / `PingMetricStatsParams` 缺少 index signature 导致 type-check 失败；已修复后重跑通过。
- 按用户要求只参考官方 `komari-monitor/komari-web`（radix 分支），不再参考未适配的社区主题；已在临时目录只读查看官方实现。官方主题仍大量使用 `common:getNodes` / `common:getNodesLatestStatus`，但新图表/Ping 已转向 `public:listMetricDefinitions`、`public:queryMetrics`、`public:getPingMetricStats`、`public:getPublicPingTasks`。

### 2026-07-12 v3.0 stability refactor

- 已完成只读探索和计划审批；开始按计划实施网络层、缓存层、组件算法、导出与 CSV 安全重构。
- 已核对当前实现：网络层 timeout / abort 清理、RequestManager `try...finally`、Promise cache 失效清理、Provider metadata 模块级共享缓存、拓扑 Map 索引、虚拟列表固定行高和负载采样 0 条 warn 已基本落地。
- 收尾修复 `src/utils/csv.ts`：公式注入检测正则显式覆盖前导空白、BOM、NBSP 与 `= + - @ |`。
- 收尾修复 `src/services/snapshot.service.ts` 与 `src/components/SnapshotExportPanel.vue`：新增异步 JSON 构建流程，按节点分片序列化并让出主线程，避免导出时一次性 `map + JSON.stringify` 大对象。
- 收尾补充 `src/stores/nodes.ts` 注释：节点对象本身必须保持响应式，复杂静态元数据后续应字段级 `markRaw` 或放入共享缓存，避免破坏实时指标刷新。
- 说明：此前 `AICACHE.md` 只写入任务开始状态，未继续写入实现/验证/交接；它不是自动记忆文件，必须由 agent 显式编辑。

## 验证记录

- 2026-07-14 v3.1.4 Issue #18 release：`bun run lint`、`bun run build`、`git diff --check` 通过；发布提交 `91c9b06` 已推送 `main`，Actions run `#29312369165`（#49）成功，tag / Release target 均为完整提交 `91c9b06fc5c4b5ee2636dc18779861186806abd7`，Issue #18 已关闭。线上 zip `komari-theme-Glassmorphism-build-91c9b06.zip` 大小 5,114,852 bytes，SHA-256 `f8b4c9b6f61cc66d755d7a612357d16d1d2774f9494b9b0c3ce87e572ee5da9b`，下载复核顶层结构 `komari-theme.json`、`preview.png`、`dist/`，包内版本 `3.1.4`。构建仍只有既有 `@vueuse/core` PURE 注释与 `globe` 大 chunk 警告。
- 2026-07-14 v3.1.3 release：发布提交 `4f37416` 已推送 `main`；GitHub Actions run `#29311122789` 成功。Release `v3.1.3` 为正式发布（非 draft / prerelease），target 为完整提交 `4f3741692bd81141ed542614d5b31a01ff0dc0fc`，zip 资产 `komari-theme-Glassmorphism-build-4f37416.zip` 上传状态为 `uploaded`。下载复核：大小 5,120,783 bytes，SHA-256 `f4d5f1be0c769ffc5372ab6a9b780042768f82529827b7222a843ef642605bee`，顶层结构 `komari-theme.json`、`preview.png`、`dist/`，包内版本 `3.1.3`。
- 2026-07-14 v3.1.0 release：发布提交 `14dac71` 已推送 `main`；GitHub Actions run `#42` 成功。Release `v3.1.0` 为正式发布（非 draft / prerelease），target 为完整提交 `14dac711d3e1ad1e7963c6dc2609ab6d1921f82d`，zip 资产上传状态为 `uploaded`。
- 2026-07-14 official detail metric dashboard / Ping custom range：`komari-theme.json` 解析通过，共 56 个表单行、48 个唯一 key、无重复；12 个图表族使用的 Tabler 图标均存在。最终 `bun run lint` 与 `bun run build` 通过，生成 `dist/` 和 `komari-theme-Glassmorphism-build-4e9ae53.zip`，zip 顶层保持 `komari-theme.json`、`preview.png`、`dist/`。本地 `http://127.0.0.1:5174/` 页面非空且桌面布局无重叠；本地无 Komari 后端，未完成真实节点数据下的移动端详情页、新旧 Ping 接口和 GPU 多设备实测。构建仍只有既有 `@vueuse/core` PURE 注释与 `globe` chunk 体积警告。
- 2026-07-13 managed settings compact keys follow-up：`komari-theme.json` 经 PowerShell `ConvertFrom-Json` 解析通过，共 56 个表单行、48 个唯一 key、0 个 Slot 字段、5 个 `richtext` 多行 keys 字段。混合分隔样例 `cpu,memory\ndisk process；gpu` 按顺序解析为 5 个 key。`bun run lint` 通过；`bun run build` 内含 `vue-tsc --build` 并通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-4e9ae53.zip`。构建仍只有既有 `@vueuse/core` PURE 注释和 `globe` 大 chunk 警告。
- 2026-07-13 Komari 1.2.6 detail/settings/iOS adaptation：`bun run lint` 通过；`bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-4e9ae53.zip`。Zip 顶层已核对为 `komari-theme.json`、`preview.png`、`dist/`；清单 71 个设置 key 无重复。390x844 浏览器检查无横向溢出，中文与旧浏览器提示可读。因本地无 Komari 后端，尚未验证真实 1.2.6 数据、后台保存流程和 iOS 15.4 真机；构建仍仅有既有 `@vueuse/core` PURE 注释和 `globe` 大 chunk 警告。
- 2026-07-13 light-mode flash and home reveal follow-up：`bun run lint` 通过；`bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-4e9ae53.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。本轮将 light mode 根背景、默认毛玻璃 preset、自定义默认色、Firefox fallback、默认背景和 loading/video fallback 全部压到低亮灰蓝雾面；自定义图片预加载阶段保留默认背景兜底；LoadingCover/app shell/router/HomeView 增加更柔和过渡并遵守 `disablePageAnimation` / reduced-motion。未做真实浏览器硬刷新录屏或真实 Komari 自定义背景验证，需在真实环境中确认视觉效果。
- 2026-07-13 home refresh flash fix / custom background / ping follow-up：`bun run lint` 通过；`bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-4e9ae53.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。已修复 `#app` 不透明背景覆盖自定义背景的问题；已调整自定义背景启用时的 `LoadingCover`，刷新加载阶段不再覆盖白雾遮罩/Loading 文案，仅保留轻量圆形指示器，并移除外层 Transition blur；图片背景预加载阶段不再显示纯白 token 占位，普通 loading 改低对比灰蓝/深色。已修复首页 Ping metric null 点误计丢包；首页小卡延迟/丢包采样条按用户反馈恢复为等高整条颜色分级；legacy `common:getRecords` fallback 仍保留按 `value < 0` 计算丢包。未做真实浏览器夜间首屏录屏、真实 Komari 自定义背景验证或新旧后端 Ping 实测，需在真实环境中确认视觉效果与 Ping 摘要。
- 2026-07-13 v3.0.1 release refresh：README 已重写为更短、更有设计感的功能介绍，致谢已收束到文末；`komari-theme.json.version` 已更新为 `3.0.1`，准备按发布契约推送 main 触发新 release。
- `bun run lint`：通过；本脚本带 `--fix`，运行后已继续执行 build 验证。
- `bun run build`：首次失败，原因是 `src/utils/rpc.ts` 的 `MetricQueryParams` / `PingMetricStatsParams` 传给 RPC `call()` 时缺少 `Record<string, unknown>` index signature；已补充 `[key: string]: unknown` 后重跑通过。
- `bun run build`：最终通过；生成 `dist/` 与 `komari-theme-Glassmorphism-build-881385d.zip`。构建中仍有既有 Rollup 提示：`@vueuse/core` PURE 注释位置警告，以及 `globe` chunk 超过 600 kB 的体积警告。
- CSV 攻击样例检查：通过。对 `"\t=cmd|' /C calc'!\r\nFakeNode,10.0.0.1,Admin"` 调用 `escapeCsvCell()` 输出为单个加引号 CSV cell，内容前置半角单引号并保留 CRLF 在 RFC 4180 引号包裹内。
- 2026-07-13 official metric-store feature port：`bun run lint` 通过；`bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-881385d.zip`。构建中仍有既有 Rollup 提示：`@vueuse/core` PURE 注释位置警告，以及 `globe` chunk 超过 600 kB 的体积警告。
- 2026-07-13 full official feature port：首次 `bun run lint && bun run build` lint 失败（LoadChart `chartData` 前置引用）；第二次 build 失败（`parseChartDashboardTemplate` 局部变量类型过窄）；均已修复。最终 `bun run lint && bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-881385d.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。
- 2026-07-13 settings compaction / GPU switch：`bun run lint && bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-881385d.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。
- 2026-07-13 v3.0.0 release prep：README 已删除预览图并重写为实用功能介绍，`komari-theme.json.version` 已更新为 `3.0.0`；`bun run lint && bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-881385d.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。
- v3.0.0 已提交并推送 main：commit `c50f6ed`；GitHub release workflow #34 已成功；Release `v3.0.0` 已发布，资产为 `komari-theme-Glassmorphism-build-c50f6ed.zip`。
- 2026-07-13 v3.0.0 frontend follow-up / AuditLogPanel：`bun run lint` 通过；`bun run build` 通过，生成 `dist/` 与 `komari-theme-Glassmorphism-build-6ccc9d7.zip`。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。
- 2026-07-13 v3.0.2 home card cleanup：按用户反馈移除首页 NodeCard 的物理核心文案和磁盘“数据积累中”提示，HealthSummaryPanel 也不再输出该提示；详情页 LoadChart 磁盘模块继续显示磁盘预测和样本不足原因；`bun run lint && bun run build` 通过，生成 `dist/` 与本地 `komari-theme-Glassmorphism-build-7be6c21.zip`（提交前短 SHA）。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。
- 2026-07-13 chunk/request pressure follow-up：同步 `origin/main` 后首次 `bun run lint && bun run build` 因远端 README 标题从 H1 跳到 H3 触发 `markdown/heading-increment` 失败；已将副标题改为 H2 并同步 README 当前版本为 v3.0.3。重跑 `bun run lint && bun run build` 通过；构建输出新增 `assets/v3-services-*.js`（约 54.67 kB / gzip 18.22 kB），用于合并 v3 共享服务/工具模块；生成 `dist/` 与 `komari-theme-Glassmorphism-build-94691f1.zip`（提交前短 SHA）。构建仍有既有 `@vueuse/core` PURE 注释警告与 `globe` chunk 超过 600 kB 警告。已提交并推送 main：commit `8b40b59`；GitHub release workflow #29231673966 成功；Release `v3.0.3` 已发布，资产为 `komari-theme-Glassmorphism-build-8b40b59.zip`。

## 风险点

- `bun run lint` 当前脚本包含 `--fix`，会自动修改文件；如需运行，应在运行后检查 diff。
- PingChart、首页 Ping 摘要、LoadChart 历史模式已优先尝试 public metric store，并保留 legacy fallback；HealthSummaryPanel 尚未迁移到 metric store。
- PingChart 自定义范围在 metric API 可用时精确传 `start/end`；legacy fallback 会按保留时间扩大回溯后再裁剪，但仍受旧接口最大保留时长与 6000 点上限约束。
- AuditLogPanel 已按 `admin:getLogs` 接入但尚未在真实登录后端手动验证返回形态；若后端字段或分页语义变化，需按真实响应微调。
- 自定义 LoadChart 时间范围在 metric API 可用时精确传 `start` / `end`；旧后端 fallback 仍只能近似为“最近 N 小时”。
- `traffic_up` / `traffic_down` 当前只做字段接收与历史 normalize，不替换现有流量 UI 语义。
- `message` 已在 NodeCard / NodeList 以纯文本 tooltip 展示，禁止 `v-html` 的约束仍需保持。
- JSON 导出已经分片构建节点字符串，但最终字符串拼接和 Blob 创建仍是浏览器同步边界；相比原先整棵大对象 `JSON.stringify` 已降低主线程尖峰。
- 不应对整个 `NodeData` 使用 `markRaw`，否则会破坏实时 CPU、内存、网络和在线状态响应式刷新。

## 交接说明

已完成：

- 首页强闪屏修复：首屏前预设暗色 class/color-scheme、文档初始背景 token 化、LoadingCover 去除 `bg-white/80`、密集节点卡片禁用首轮动画与在线状态扩散环。
- 自定义背景图片 follow-up：`src/styles/main.css` 不再给 `#app` 设置不透明背景，避免遮住 `Background.vue` 的 fixed 背景层；仍保留 `html` / `body` token 背景来降低首屏白底闪现。`LoadingCover.vue` 在自定义背景启用且当前模式有背景 URL 时不再铺白雾遮罩/Loading 文案，仅保留轻量圆形指示器。
- 本次未做真实浏览器夜间首屏录屏或真实 Komari 自定义背景验证；建议在真实 Komari 多节点环境中用暗色/auto 模式硬刷新首页，并打开自定义背景图片确认无白屏闪烁且背景可见。
- HTTP/WS timeout 与 abort 清理、RequestManager 队列 `finally` 释放、共享 Promise reject/finally 清理。
- Provider metadata 模块级共享缓存与 `markRaw` 元数据。
- NodeTopologyPanel 拓扑索引与离线上游解析复杂度优化。
- NodeList 虚拟列表固定行高与文本截断防御。
- useNodeLoadStats 对在线节点 0 采样的 DEV warn。
- CSV 公式注入与 RFC 4180 转义收尾修复。
- Snapshot JSON/CSV 导出加载态与异步分片构建。
- `AICACHE.md` 已从旧文档任务交接内容更新为当前 v3.0 任务状态。
- Komari 1.2.x 第一批兼容补丁已完成：RPC/API 类型补新字段、`common:getRecords` `maxCount` 兼容、public RPC/metric 方法壳、历史 records array/map normalize、节点 store 同步新字段、详情页展示物理核心。
- 官方 komari-web 高价值功能移植第一批已完成：metric series 工具、metrics service、PingChart / 首页 Ping 摘要 metric 优先 + legacy fallback、NodeCard / NodeList 探针 `message` 纯文本提示。
- 用户要求“全部上马”后的剩余官方功能已完成：LoadChart 历史模式 metric store 优先 + legacy fallback、GPU detail/per-device metric 图表、`chartDashboardTemplate` 托管配置读取和布局排序。
- 详情页 Metric Store 扩展已完成：25 个官方 definition 归并为 12 个图表族，补齐流量、显存、温度、Ping 延迟/丢包卡片及预设；概览恢复宽屏 4 列和 8/12/16 卡预设；PingChart 支持自定义起止时间并补强新旧丢包 fallback。
- v3.0.0 复查 follow-up 已完成：物理核心 UI / 每核成本、自定义 LoadChart 时间范围、metric definitions TTL 缓存、`SharedCache.retain()` 修复、AuditLogPanel、磁盘预测数据积累提示、NodeCard 显式传 `LOAD_RECORD_MAX_COUNT`。

未完成：

- chunk/request pressure follow-up 已完成：`vite.config.ts` 新增 `v3-services` manual chunk；`LoadChart.vue` legacy fallback 与详情页统计统一使用 `LOAD_RECORD_MAX_COUNT` 维度，降低重复历史请求概率。
- HealthSummaryPanel 尚未接入 metric store。
- 尚未实现后台写入/保存 `chartDashboardTemplate`，当前只读取托管配置。
- 尚未在真实 Komari 1.2.x 后端上手动确认 `public:getPingMetricStats` / `public:queryMetrics` / GPU metric 返回形态；当前只通过类型检查、lint、build 验证。

下一步：

1. 人工查看当前 diff，注意工作区还包含此前 v3.0 稳定性重构和 AI 文档改动，不只有本批 Komari 1.2.x 适配。
2. 在真实新版后端打开 PingChart 和 LoadChart，确认 Network 优先出现 `public:getPingMetricStats` / `public:queryMetrics`，旧后端确认 fallback 到 `common:getRecords` / `loadNodeLoadRecords`。
3. 有 GPU 节点时检查 GPU 卡片、per-device tooltip、显存百分比和温度展示；无 GPU 节点时确认 GPU 卡片自动隐藏。
4. 若不希望提交构建产物，提交前按项目发布流程决定是否保留本次 `dist/` 与 zip 输出。

---

## 上一个任务记录

- 状态：done
- 目标：整理 AI 开发入口文档，新增 AIAGENTREADME 与 AICACHE，让 AI/二开者能理解项目架构、开发路径和交接方式。
- 范围：根目录 AI 文档、Claude/Agent 指引、src 作用域指引、AI 工作缓存模板。
- 不做：不改运行时代码、不改主题版本、不改 release workflow。

## 上一个任务执行日志

### 2026-07-12

- 新增 [AIAGENTREADME.md](AIAGENTREADME.md)：集中说明项目是什么、技术栈、架构分层、服务层职责、开发路径、发布契约、安全/性能规则和 AI 交接要求。
- 重写 [CLAUDE.md](CLAUDE.md)：精简为 Claude Code 入口，指向 AIAGENTREADME、AICACHE 和最近作用域 AGENTS。
- 重写 [AGENTS.md](AGENTS.md)：精简为根作用域 agent 指引，保留 build/release/root map/safeguards。
- 重写 [src/AGENTS.md](src/AGENTS.md)：精简为 src 子树实现规则，强调 v3 分层、store/service/UI/security/validation。
- 新增本文件 [AICACHE.md](AICACHE.md)：提供持久化待办、执行日志、验证和交接模板。

## 新任务模板

复制以下模板到“当前任务”或追加到执行日志：

```markdown
## 当前任务

- 状态：planned | in-progress | blocked | done
- 目标：
- 范围：
- 不做：
- 负责人/代理：

## 执行日志

### YYYY-MM-DD HH:mm

- 做了什么：
- 改了哪些文件：
- 决策原因：

## 验证记录

- 命令：
- 结果：
- 警告：
- 未验证项及原因：

## 风险点

-

## 交接说明

已完成：

-

未完成：

-

下一步：

1.
```

## 2026-07-15 Preview redesign (M4)

- Redesigning `docs/preview.png` because the current marketing-hero composition is too close to Komari Emerald (left title, large globe, three-word slogan).
- New direction: a product-first monitoring dashboard scene with frosted node cards and compact telemetry, no globe, no Emerald logo, no marketing slogan.
- Generated `output/imagegen/komari-glass-dashboard-preview-v2.png` with `gpt-image-2` (high quality) and selected its 1280x720 web derivative after visual inspection. The new composition is a full monitoring workspace with a top status strip, network overview, and six node cards.
- Runtime screenshot/mock work was deferred. `docs/preview.png` was replaced with a pure conceptual settings cover: no version badge and no actual page preview; it emphasizes eight configurable areas over the generated cyan/mint/lilac glass background.
- Shortened the managed configuration menu label from `Glassmorphism 设置` to `主题设置`.
- Release audit found `applyClient()` did not refresh the new billing fields after initial load. v3.1.7 now updates rates, anchor state, cumulative traffic, and startup-fee-applied state during the existing client metadata polling cycle.
- Fixed the misleading `完整` general-card preset: it was hard-coded to six cards even though the responsive renderer supports additional rows. It now expands to every unique `ALL_GENERAL_CARD_KEYS` entry; other presets remain curated six-card layouts.

## 2026-07-15 v3.1.7 release candidate

- `bun run lint`: passed.
- `bun run build`: passed, including `vue-tsc`; only the existing Rollup annotation and large globe chunk warnings remain.
- Local archive contains `komari-theme.json`, `preview.png`, and `dist/index.html`; embedded manifest version is `3.1.7` and configuration name is `主题设置`.
- Home -> detail -> home was browser-verified earlier with no refresh and no Fragment/Transition warning after moving `PingMonitorDialog` inside the single `HomeView` root.
- Komari PR #604 head `f08f47d` is `CLEAN` / `MERGEABLE`; all frontend and cross-platform binary checks succeeded.
- komari-web PR #82 head `0fee1f1` is `CLEAN` / `MERGEABLE`; that exact commit is embedded under `public/admin-app/`.
- Local-only `.claude/`, `output/`, and `tmp/` must remain uncommitted.

## 2026-07-15 v3.1.7 published

- Release commit: `3710532164e6b58433373199321d2977574e9913`.
- GitHub Actions run `29428658864`: success.
- Release: `https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases/tag/v3.1.7`.
- Published asset: `komari-theme-Glassmorphism-build-3710532.zip`, SHA-256 `ac1a203a53a5d31fdc8a148964e1e64f1659dea7beb9745c906a8731686180a4`.
- Downloaded asset verification passed: manifest `3.1.7`, `主题设置`, `preview.png` hash equals repository preview, and `dist/index.html` exists.
- Old preview seen after upgrading is browser cache: komari-web uses `/themes/<short>/<preview>` without a version query. A hard refresh/cleared image cache displays the released image; a durable cache-busting change belongs in komari-web.
- Maintainer feedback indicates the real-time billing PRs do not fit Komari's simple cycle billing model. Treat Komari #604 and komari-web #82 as experimental fork work pending explicit upstream acceptance: wall-clock hourly estimates include offline time, traffic estimates do not reset by billing cycle, and startup fee is a static one-time add-on rather than a cycle item.

## 2026-07-15 v3.1.8 Swap tooltip hotfix

- Root cause: the Swap hover used `DataTooltip`, whose absolutely positioned content remains inside the node-card overflow boundary. The card clipped the tooltip into a thick horizontal bar that overlaid unrelated content.
- Fix: memory metrics now use a native `title` tooltip, which does not participate in card layout or clipping. The text reports `Swap 已用 <size> / 总计 <size>` and falls back to used-only when total is unavailable.
- Guardrail: do not use the current non-portal `DataTooltip` for content that must escape node/list containers with overflow clipping; use a native title or a portal-backed overlay.
- Validation: `bun run lint` and `bun run build` passed. The local archive contains `komari-theme.json`, `preview.png`, and `dist/index.html`; its embedded manifest is version `3.1.8` with configuration name `主题设置`.
