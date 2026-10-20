# AI Cache / Agent Handoff Log

> 这个文件给 AI 编程代理和二开维护者使用，用来保存任务计划、执行日志、验证结果、风险点和交接信息。它的目标是防止断网、会话丢失、上下文被压缩后无法继续工作。

## 使用规则

- 开始多文件、架构、安全、发布、迁移类任务前，先新增或更新“当前任务”。
- 开发中按时间追加“执行日志”。
- 结束前必须更新“验证记录”和“交接说明”。
- 不要写入密钥、token、cookie、服务器密码、私有用户数据。
- 如果记录过期，直接标注“已完成/已废弃”，不要让后续 AI 误判。

## 当前任务

- 状态：in-progress，Issue #62 修复与 v3.4.3 发布（2026-10-20）。用户授权修复、发布、推送、回复及关闭 issue。
- 范围：M4 节点 / 全局失效任务显式移除入口；M6 聚焦回归与发布核验。任务目录为空或加载失败也允许主动移除；不根据搜索结果或目录错误自动删除绑定。
- 计划：实现 -> lint / build / 聚焦浏览器回归 -> 版本与 README -> 提交 / 推送 main -> 核对 Actions / tag / 下载包 / SHA-256 -> 回复并关闭 #62。
- 初始 Git：HEAD 与 origin/main 均为 fa48ccd；保留用户原有 5 张 docs 预览图删除和 output/tmp。gh auth status 被自动审批策略拒绝，未读取凭据；公开 REST 可核验，Git fetch 可用。
- 实现：节点 / 全局编辑器显式列出不在完整目录中的已选 ID，允许逐个移除；复用原 toggle / 管理员验证 / 合并保存路径。目录加载失败不自动清空，搜索不影响失效 ID 区域。
- 本地验证：lint、类型检查 / build、聚焦浏览器配置回归 11/11 已通过；包含节点 / 全局 × 正常 / 空 / 失败目录 6 个场景，验证释放名额、空选回退和保留隐藏 / 未编辑节点。构建仅有既有 VueUse 注释和大 chunk 警告。
- 发布 Issue 收尾：新增可复用 Resolve Released Issues 工作流，仅处理发布提交显式 `Release-Issues: #62` trailer；等待同提交三个 push 工作流全部成功，校验 tag SHA、下载 zip 的版本 / 布局 / 大小 / SHA-256 后，幂等回复并关闭指定 issue。无需读取本机 GitHub 凭据。
- 发布工作流验证：YAML / 嵌入 JavaScript 语法和 6 个模拟场景通过（成功、检查失败不写、无 trailer 不写、digest 不符不写、tag 不符不写、重复回复去重）。本地 zip 顶层仅 manifest / preview / dist，包内版本 3.4.3。

- 状态：done，towersip 三网展示与设置移植已发布 v3.4.1（2026-10-12）
- 范围：M4 下游共享列宽 / 轻量行高 / 状态配色 / 历史浮窗；M5 独立样式开关、任务选择与按服务器编辑；M6 默认 / 三网 / 手机 / 保存权限回归。保持 compact 的实际宽度，不强制改成 comfortable；修复 Ping 统计浮窗对比度。
- 来源：towersip a41270e460ee003e33f25091e8f3b3a950675662；保留主线请求缓存、断线、实时更新和手机轻点 / 滑动边界。按服务器设置适配为首页弹窗，保留两个公开路由；保存通过服务层验证管理员并合并最新主题设置。
- 计划：移植视觉与设置 -> lint / build / 浏览器回归及截图 -> 更新来源与交接 -> Git 阶段存档。
- 验证：lint / vue-tsc / build / diff --check 通过；完整 Playwright 42/42（55.6 秒）。实测 compact 曲线卡片与默认宽度相同、增加 24px 高度；覆盖三网方柱 / 曲线、空选择总览、实时更新 / 缺测、手机滚动、全局及节点 ID 保存、保留隐藏 / 未编辑节点与最新无关设置、204 成功响应、会话失效禁止保存。Ping 浮窗标签在亮 / 暗色通过 >=4.5:1 实际配色检查。截图位于 test-results/three-net-_.png 与 ping-tooltip-_.png；未声称真机 Safari 测试。
- 存档：7c0419c 三网展示 / 对比度；f37641d 全局 / 节点编辑器与保存服务 / 致谢；0b1d9b7 版本与发布记录，已推送 main。
- 发布证据：v3.4.1 tag 指向 0b1d9b75508f68a5501c443b4eaae405acc7e334；Code Quality 38247509073、Release On Version Bump 38247509052 成功。公开 Release 的 komari-theme-Glassmorphism-build-0b1d9b7.zip 为 7,619,734 bytes / 775 entries，GitHub digest 与下载 SHA-256 均为 bf2ceb4afce12d2bdfb615221e4dcff4bf23bc15649a719c972ee41184836e75；已核对 manifest 3.4.1、顶层布局、许可、compact 默认和两个三网开关默认关闭。
- M6 远端回归修复：Visual Regression 38247508936 的 4 个失败由测试仅支持旧 vue-echarts ref 结构导致。通过公开 nightly.link 获取失败产物，SHA-256 与 GitHub artifact digest 一致；对实际下载的发布包复现，再兼容 8.0.2 的解包图表实例。发布包完整回归 42/42（57.7 秒）及 lint 已通过，不修改运行时代码或版本；测试修复提交 4ab659f 已推送，Visual Regression 38249323286、Code Quality 38249323330、Release On Version Bump 38249323142 全部成功。gh auth status 被自动审批拒绝，未读取凭据或判断 token 过期，使用正常 Git 与公开 API 完成发布核验。

- 状态：done，继续吸收优化并发布 v3.4.0（2026-10-12）
- 用户授权：补充值得融合的优化 / 修复、统一测试、推送 GitHub 并发布新版本；沿用分阶段 Git 存档与来源致谢。
- 范围：M3 地理地址 / 坐标校验与异步失效，M4 WebGL 地图回退 / 触屏浮窗，M5 可选分组计数与保留期内长范围，M6 回归、来源、版本与发布证据。A4 默认关闭、compact 默认及公共路由契约继续保留。
- 计划：核对源代码增量 -> 移植 / 改写与聚焦验证 -> 更新致谢 / 3.4.0 -> lint / build / 完整适用回归 -> 推送 main -> 核对 Actions / tag / Release / 下载包 SHA-256 与包内配置。
- GitHub：origin/main 已刷新，仍为 e0aedb0；gh auth status 被自动审批策略拒绝（never 无法审批），不判断 token 过期，不读取凭据。使用正常 Git 推送触发已有 release workflow，公开 REST API 验证结果。
- 第二阶段实现：WebGL 能力检测 / 初始化及上下文丢失回退平铺地图；公网 IP 字面量与 IPv4-mapped 校验、IPv6 地理回退、权限与异步代次保护；手机 Tooltip 手势区分；可选分组计数；按后端保留期显示 7 / 15 / 30 天 Ping 范围。来源 pwremilk、3560912451zz-stack、casiuna、zfloong 已写入 README、融合记录与 THIRD-PARTY-NOTICES。
- 新增验证：fork-followup 13/13、三网与图例 / Issue #59 聚焦 24/24；随后完整视觉矩阵 37/37（49.4 秒）；lint、vue-tsc、build、diff --check 已通过。包为 3.4.0，773 entries，SHA-256 AA9A8DF26475B60B277B54726706D70EB6A99F5FBC925F1ECE6869F73686CF4C。
- 发布证据：提交 328d71b18ec9df8dcc8c499dace2bbc9db9d7d7c 已推送 main；Code Quality run 38238148317 成功；Release On Version Bump run 38238148334 成功，Release 3.4.0 已公开发布并指向该提交，资产 komari-theme-Glassmorphism-build-328d71b.zip 7,612,048 bytes，GitHub digest / 下载 SHA-256 1d32a368b0f5db9db1460402db37ce0bcd8646b0b8459c77ec0ec7372cb4297b。Visual Regression run 38238148469 在 Linux runner 失败，公开页面未提供日志且匿名 artifact 下载要求认证；本地同一套 37/37 已通过，不能将远端视觉检查标为成功。

- 状态：done，A4 可选三网曲线、性能 / 手机优化、致谢及主题包完成（2026-10-12）
- 用户要求：三网小曲线做成可开启设置，默认保持原展示；性能与外观按收益融合；制作过程分阶段 Git 存档；致谢写作者链接及吸收代码。
- 里程碑：M5 可选三网曲线、M2 请求缓存 / 后台刷新、M4 手机布局、安全区及兼容性、M3 图表文本转义、M6 验证与来源致谢。
- 计划：保存已验证 UI 修复 -> 服务缓存与生命周期 -> 默认关闭的三网任务曲线与精确绑定 -> 手机适配 / 图表显示正确性 -> 致谢、验证、最终提交与主题包。
- Git：工作分支 `codex/optional-three-net-sparklines`，仅提交本任务文件；保留现有 5 张预览图删除、AICACHE 历史修改、output/tmp，不推送或发布。
- 实现：A4 默认关闭；全局 / UUID 任务 ID 绑定、自动运营商选择、最近一小时 20 个时段曲线、手机轻点 / 滑动区分、键盘选点；逐任务曲线复用既有历史请求，缺测断线、实时状态持续更新。公共目录缓存 5 分钟、共享可见刷新、离线 / 后台暂停与恢复；保持 HomeView KeepAlive 失活时释放订阅。
- 其他优化：Header / Footer / BackTop / AppDialog 安全区，手机长标题与详情操作条布局；Ping 展示 EWMA 不补空值，重复任务名按 ID 区分，Ping / GPU / 通用指标浮窗的外部名称 HTML 转义。图例与浮窗修复仍有效。
- 存档：`b90769f` UI 修复与审查；`ecd3fc4` 缓存 / 调度；`da42c8e` A4 与图表正确性；`1b0cbf7` 手机布局 / 包内许可；最后另存 README / 融合记录 / 本任务交接。包对应最后源码提交 1b0cbf7，后续只有文档提交。
- 来源致谢：README 表格列 towersip / thinkemm / VoyagerProbe 的作者和项目链接、吸收内容；`docs/fork-integration-2026-10-12.md` 固定来源完整 SHA、主线取舍。`public/THIRD-PARTY-NOTICES.txt` 将原 MIT 版权与许可完整带入 dist / ZIP。
- 验证：最终 `bun run lint` / `bun run build` / `git diff --check` 通过；聚焦 Playwright 13/13（23 秒），涵盖默认无额外目录请求、ID 绑定、实时刷新、缺测断线、实际手机滚动不误触、键盘操作、缓存复用、后台暂停恢复、页面切换、重复名称 / HTML 转义、图例实际布局、Issue #59 遮挡回归。手机交互与窄屏布局验证为 Chromium，未声称已在真机 Safari 验证。
- 最终包：`komari-theme-Glassmorphism-build-1b0cbf7.zip`，3.3.8，7,600,938 bytes / 773 entries，SHA-256 `61a2ceabc2e403c477e65d527c4be28821acef4a07770f171133436c5f49bfb0`。核对顶层仅 manifest / preview / dist，preview 与 docs/preview.png 一致、全部 dist 内容一致、许可存在、A4 默认 false / 卡片默认 compact；版本未改。
- 可核对截图：`test-results/three-net-desktop.png` / `three-net-mobile.png`，以及 chart-legends-_/ ping-tooltip-_。其他候选保留审查报告，未盲目合并 fork 全树、后端插件、个人 API 或 SW。

- 状态：done，详情页负载图表图例与对齐修复（2026-10-12）
- 目标：按截图补 CPU / 负载图例，统一所有负载图的图例标记、字体、底部基线与标题图标尺寸，并覆盖移动端。
- 里程碑：M4 UI/UX + M6 聚焦浏览器验证；不改变数据采样、请求或业务指标。
- 初步根因：CPU / 进程无图例、绘图区 bottom 为 32，其他图为 52；内存 / 磁盘图例为 10×8 / 10px，网络等为 12×12 / 11px；标题副标题可能改变卡片内高度。
- 实现：共享 `METRIC_CHART_GRID` / `METRIC_CHART_LEGEND`，固定 10×10 圆角图例、11px 字号与 52px 底部绘图区留白；CPU / 负载和进程补图例；所有指标标题高度 40px，图标框 32px / SVG 18px。统一为单行可滚动图例并注册 LegendScrollComponent，长 GPU / Ping 名称不因换行破坏对齐。
- 视觉核对追加修复：MetricSeriesChartCard 的 Canvas 颜色原来使用无法解析的 CSS var，暗色时坐标发黑且图例文字随曲线色；抽出纯主题色 helper，与负载图共享实际 rgba 颜色。
- 验证：`bun run lint`、`bun run build`、`git diff --check` 通过；图表布局用例 3/3 通过，覆盖默认桌面 6 图、完整桌面及手机 12 图，检查实际绘制图例边界 / 同排基线 / 图标尺寸 / 图例文字色 / 点击切换 CPU / 页面无横向溢出；Issue #59 回归仍 3/3 通过。
- 产物：默认六图截图 `test-results/chart-legends-default-desktop.png`，完整截图 `test-results/chart-legends-light-desktop.png` / `chart-legends-dark-mobile.png`；本地包仍为 `komari-theme-Glassmorphism-build-e0aedb0.zip`，版本未改。

- 状态：done，候选审查完成，等待用户选择融合范围（2026-10-12）
- 目标：按用户最新要求，先整理首页三网卡片、手机浏览器布局及性能等有价值的优化，提供来源、建议和风险，等待选择后再融合。
- 里程碑：按候选分别归类 M2 性能、M3 安全、M4 UI/UX、M5 功能及 M6 验证；每项保留来源 SHA 和取舍。
- 计划：建立仓库清单 -> 比较独有提交 / 源码和当前实现 -> 审查许可证与兼容性 -> 输出编号候选、建议及来源 -> 等待用户选择 -> 另行移植和验证。
- 进度：已检索 53 个关联 fork 及 6 个名称匹配的独立仓库（其中 1 个为原仓库，共 58 个衍生候选）；抓取默认分支至 fork-audit 临时引用。按最新要求已撤回本次试接的 fork 源码，保留 Issue #59 修复和原有本地改动。
- 完成：额外追溯已更名的 Transit，共 59 个审查快照；58 个同名 / fork 候选中 29 个无本地主线以外提交。MIT 许可证均已读取；所有来源 HEAD SHA 固定并记录。
- 交付：`docs/fork-optimization-review-2026-10-12.md`，A1–A7 首页卡片、M1–M7 手机、P1–P4 性能、Q1–Q5 正确性 / 安全、F1–F6 功能；逐项有地址、增量、建议及风险，附 59 个仓库来源表。原仓库三种卡片图保存于 `docs/fork-review-20261012/`。
- 推荐：A2 + F1；基础优化先选 M1 / M2 / M3 / M5 / M6 / P1 / Q1 / Q2，以及 F3 的窄屏轴标签避让。P2 / P3 按节点规模分阶段，估算 / 后端插件 / Worker 等另行选择。
- 下一步：按用户选择移植；fork 功能均未合入。源码仅保留两项明确要求的本地 UI 修复，没有推送、版本递增或发布。
- 约束：保留已完成的 Issue #59 修复和现有本地改动，遵循现有服务 / 请求 / 缓存 / 权限分层和主题包契约。

- 状态：done，Issue #59 本地修复及浏览器验证完成
- 目标：修复首页 Ping 弹窗中任务信息提示被遮罩和弹窗盖住的问题。
- 里程碑：M4 UI/UX；修复共享 Tooltip 层级，保留 reka-ui 的定位、Portal 与碰撞避让。
- 已确认：Issue 截图对应任务信息图标；Tooltip Portal 挂到 body 后层级为 50，低于 AppDialog 遮罩 100 / 内容 101。图表提示不是本次截图中的问题。
- 实现：`TooltipContent.vue` 默认层级由 `z-50` 改为 `z-110`，使 body Portal 中的提示高于 AppDialog；继续保留现有自动定位、碰撞避让和动画。
- 回归：`tests/visual/visual.spec.ts` 新增 3 组场景（亮色桌面、暗色桌面、暗色移动触控），覆盖任务统计、平滑峰值说明、弹窗关闭清理和公开详情页；通过视口边界和提示四个采样点的 `elementFromPoint` 检查实际遮挡，而非只检查 DOM 可见性。
- 验证：旧代码的亮色桌面回归在遮挡断言处实际失败；修复后 `bun x playwright test --grep 'ping dialog tooltips' --timeout 30000` 为 3/3 通过（9.5 秒）。`bun run lint`、`bun run build` 和 `git diff --check` 通过；构建只有既有 VueUse PURE 注释和 globe chunk 体积警告。
- 交付：本地包 `komari-theme-Glassmorphism-build-e0aedb0.zip`；修复前后截图保存在 `test-results/ping-tooltip-*.png`。未提交、推送、改版本或发布，Issue #59 仍打开。
- 工作区：原有 AICACHE 内容、5 张历史预览图删除及 output/tmp 目录均保留，不纳入本次源码修复。

- 状态：in-progress，Issue #56 暗色模式原生下拉弹层修复
- 目标：将详情页节点切换器和财务详情中的 6 个原生 `<select>` 替换为主题可控的 reka-ui Select，核对自动发布流程，推送修复并关闭 Issue #56。
- 里程碑：M4 UI/UX 兼容性修复 + M6 发布验证；不修改 Komari API 或业务计算。
- 范围：新增共享主题 Select 组件，保留现有值更新与节点导航行为；远端已有 v3.3.7，本次发布版本递增为 v3.3.8。
- 进度：已完成源码迁移、类型检查、lint、build；已快进到远端最新 main，提交 `e0aedb0` 推送成功，README 与 manifest 已更新到 v3.3.8，Actions/Release 已公开核对成功。Issue #56 尚未关闭：GitHub 浏览器会话未登录，页面已停在登录入口，待登录后回复并关闭。

- 状态：done，Issue #48 已修复、发布并回复关闭
- 目标：修复 `earthRenderer=tiled` 时首页总览卡片配置被固定卡片覆盖的问题，并让 GitHub Actions 自动执行 lint/build。
- 里程碑：M4 UI/UX 兼容性修复 + M6 CI/DX；不改变地图渲染器、卡片 schema 或 Komari 接口契约。
- 已确认缺陷：`NodeGeneralCards.vue` 在平铺地图可见时用 `tiledDefaultCardKeys` 替换 `appStore.generalCardOrder`；隐藏地球后该条件失效，现象与 Issue #48 完全一致。
- 计划：所有布局统一消费 `generalCardOrder`；补平铺自定义卡片顺序回归；新增 PR/main 自动 lint/build 工作流；发布 v3.3.6 后以 Actions、Release 资产和 Issue 回复为最终证据。
- 本地验证约束：按用户要求不在本机执行 lint/build，交由 GitHub Actions；本机仅做静态差异、YAML/JSON 与 `git diff --check` 检查。
- 推送：提交 `b353afb` 已推送 `main`，正在等待 Code Quality、Visual Regression 与 Release On Version Bump 三条 GitHub Actions 结果。
- 自动验证：Code Quality run `31800244707`、Visual Regression run `31800244708`、Release On Version Bump run `31800244724` 均成功；lint/build 只在 GitHub Actions 执行，未在本机运行。
- 发布：tag / Release `v3.3.6` 指向 `b353afb37e030ab6c0c66b5a3e4546bd91ec5cd1`；资产 `komari-theme-Glassmorphism-build-b353afb.zip` 为 7,587,372 bytes，GitHub digest 与下载后 SHA-256 均为 `FD19C0D55E2D0C3A6744A3936E393F3A8C9E8B19D58836A7D2D9752476345557`。
- 包验证：771 个 entries，包内版本 3.3.6，顶层契约保持 `komari-theme.json`、`preview.png`、`dist/`；Issue #48 已附修复、Actions 与 Release 链接后按 completed 关闭。

- 状态：done，v3.3.5 已发布
- 目标：修复详情页延迟任务卡片、图例和主页 Ping 指标线与 Komari 后台任务排序不一致的问题。
- 里程碑：M4 UI/UX 兼容性修复，不修改后端任务权重或接口契约。
- 已确认缺陷：后端 `GetAllPingTasks()` 明确按 `weight ASC, id ASC` 返回；主页重新计算该规则，详情页新版指标路径却按 `getPingMetricStats` 的无保证数组顺序重建任务，可能与后台错位。
- 实现：共享排序工具改为使用 `public:getPublicPingTasks` 返回数组索引；LoadChart 的 Ping 指标线和 PingChart 新指标路径重建的任务卡片、图例、颜色均使用该顺序；指标接口独有的未知任务按数值 ID 稳定追加。
- 回归：夹具构造后台 `30,10,20`、指标统计 `20,30,10`、ID 自然顺序 `10,20,30` 三套冲突次序；直接排序断言通过，Playwright 能收集到详情页卡片顺序用例。
- 验证：`bun run type-check`、涉及文件 ESLint、`bun run lint`、`bun run build`、`git diff --check` 均通过；生成 `komari-theme-Glassmorphism-build-e212925.zip`，顶层仍为 `komari-theme.json`、`preview.png`、`dist/`。
- 浏览器限制：托管 Chromium 可执行文件未安装；系统 Chrome 能启动唯一用例但在 Windows 驱动生命周期中停住直至 120 秒外层超时，没有返回断言结果。内置浏览器可加载本地预览，但不能复用 RPC mock，且本机没有 Komari 后端，因此未把该页面作为数据回归证据。
- 发布目标：`komari-theme.json` 与 README 同步至 v3.3.5；提交只包含 Ping 排序实现、回归夹具、版本和发布文档，排除工作区原有预览图删除与本地目录。
- 发布完成：提交 `e9a7238fea260299f5404f9be4749aa19360f48b` 已推送 `main`；Release On Version Bump run `31458840152` 与 Visual Regression run `31458840173` 均成功，tag / Release `v3.3.5` 指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-e9a7238.zip`，7,593,611 bytes；GitHub digest 与下载后 SHA-256 均为 `FF9127EE7EBD87EFEB9DD4AD58B875DA53D05CCC88C6F95181AC13392ED20A98`，包内版本 3.3.5、771 个 entries，顶层契约完整。此最终交接状态只保留在本地，避免纯文档推送再次触发工作流。

- 状态：done，v3.3.4 已发布
- 目标：节点卡片剩余 5 天内标红、6–10 天标黄；审计并修复详情页 4 小时 / 1 天历史视图 CPU 空白或异常显示。
- 里程碑：M4 UI/UX + 兼容性修复，不修改计费计算、实时指标或后端接口契约。
- 范围：共享到期阈值、NodeCard 到期提示、LoadChart 指标历史回退、确定性 Playwright 回归检查。
- 已确认缺陷：指标历史当前只检查“任意序列有点”，CPU 序列缺失或全空时仍会压过 `common:getRecords` 兼容数据，导致 CPU 图表无有效数值。
- 实现：共享阈值改为 5 天红色、10 天黄色；NodeCard 对到期状态着色并把无效日期显示为 `-`；短时历史缺少有效 CPU 点时回退 `common:getRecords`，同时保留新指标接口返回的 Ping 等独立序列；兼容记录的运行时数值先过滤非有限值再进入图表。
- 回归：新增固定时钟下的 5/10 天边界颜色检查，以及新指标接口缺少 `cpu.usage` 时 4 小时 / 1 天 CPU 兼容回退检查。
- 验证：`bun run lint`、`bun run build`、后续 `bun run build-only` 和 `git diff --check` 通过；构建产物 `komari-theme-Glassmorphism-build-b56ef97.zip` 保持 `komari-theme.json`、`preview.png`、`dist/` 顶层契约。
- 浏览器：系统 Chrome 两条聚焦用例均执行完且无失败产物，Windows Chrome 在测试结束后的关闭阶段未自行退出，由 120 秒外层超时终止；应用内浏览器确认 Vite 入口可装载，本机未运行 `127.0.0.1:25774` Komari 后端，因此普通开发页的 API/RPC 代理按预期返回 500，实际数据视图由确定性 mock 用例覆盖。
- 发布目标：`komari-theme.json` 与 README 已同步至 v3.3.4；发布提交仅包含本次修复、测试、版本和文档，不包含工作区原有预览图删除及本地目录。
- 发布完成：提交 `e2129252b358fcbc42d1fe445b736df2b8003f8c` 已推送 `main`；Release On Version Bump run `31414499653` 与 Visual Regression run `31414499655` 均成功，tag / Release `v3.3.4` 指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-e212925.zip`，7,593,495 bytes；GitHub digest 与下载后 SHA-256 均为 `6DE5F47E8EB4178572C3B78117481403EB68A8858C7A1DBDDC0D2F004CC37693`，包内版本 3.3.4、771 个 entries，顶层契约完整。此最终交接状态只保留在本地，避免纯文档推送再次触发工作流。

- 状态：done，v3.3.3 已发布且 Issue #37 已关闭
- 目标：统一 Komari `price = -1` 免费节点语义，移除“免费 / 周期”文案，并让单节点剩余价值显示“无 / N/A”。
- 里程碑：M4 UI/UX + 小范围业务展示修复；金额计算继续返回数值，不把 `NaN` 作为业务状态。
- 范围：公共价格 formatter、NodeCard、NodeList、NodeCompare、InstanceDetail、FinanceDetails 及首页财务排除免费节点逻辑；聚焦回归、v3.3.3 Release 和 Issue 收尾。
- 兼容边界：`price = 0` 现有行为不随本次变更扩大；总剩余价值和总成本中免费节点继续贡献数字 0。

- 状态：done，v3.3.2 已发布且 Issue #36 已关闭
- 目标：为节点卡片 CPU、内存、硬盘、流量指标原生增加一致的线性图标，替代依赖 custom body DOM 注入的脆弱方案。
- 里程碑：M4 UI/UX 小版本，不修改数据、请求、计费或卡片高度契约。
- 范围：普通卡片图标+文字；mini 卡片图标替代 C/M 并保留无障碍名称；必要视觉基线、README、版本、Release 与 Issue 收尾。
- 审查结论：Ping、网速、累计流量和剩余价值区已有图标；没有发现需要与本次同批处理的其他结构或性能问题。
- 不做：不增加图标组件依赖，不给所有文字机械堆图标，不调整卡片尺寸、进度条状态色或数据布局。

- 状态：done，v3.3.1 已发布且 Issue #33 / #35 已关闭
- 目标：修复 GitHub Issue #33（详情页保留首页全部节点 Ping 查询）与 #35（提前续费后的剩余价值被封顶为一个计费周期）。
- 里程碑：M2 性能修复 + 小范围业务计算纠错，不改变发布契约或长期机兼容语义。
- 范围：首页 Ping 摘要订阅生命周期、摘要采样上限、在途 metric 请求释放、两处剩余价值计算及聚焦回归验证。
- 发布：用户已明确要求发布新版，并在 Release 验证成功后关闭 Issue #33 / #35。
- 不做：不修改全局实时状态轮询语义，不调整超过 100 年的长期机展示。

- 状态：done，等待用户部署运行态测试
- 目标：生成 Linux amd64 本地集成测试包，合并验证 Komari PR #604、已合并访客审计 PR #602、komari-web PR #82 与 Glassmorphism v3.1.8 内置默认主题。
- 里程碑：M6 集成构建、测试交付与验证，不扩大现有上游 PR 范围。
- 范围：CGO Linux amd64 核心二进制、可导入主题 zip、独立管理端构建、测试说明与 SHA-256；部署后在用户保持登录的浏览器中继续联调。
- 安全约束：`visitor_audit_enabled` 保持上游默认关闭，由管理员在审计面板明确开启；测试包不预置数据库、账号、密钥或访客数据。
- 来源：Komari PR #604 `f08f47d`（含访客审计 PR #602）；komari-web PR #82 `0fee1f1`；Glassmorphism Release `v3.1.8` / `a52572a`。
- 不做：不把 Glassmorphism 默认主题替换混入计费 PR #604；不发布测试构建为正式 Release；不构建 Windows 包。

## 执行日志

### 2026-08-11 Ping task order parity

- 官方源码与测试确认 `GetAllPingTasks()` 按 `weight ASC, id ASC` 查询，公开任务接口与旧 Ping 记录接口都保留此顺序；新版 `getPingMetricStats` 结果没有等价排序保证。
- 修复不再在前端复制后端权重规则，而是以公开任务接口的数组位置作为顺序来源，使主页与详情页在后端未来调整排序实现时仍保持一致。
- 聚焦 Bun 断言结果为 `30,10,20`，Playwright `--list` 确认新增用例被收集；本机浏览器执行限制已记录在当前任务，CI 可使用仓库的托管 Chromium 完成最终浏览器回归。

### 2026-07-30 v3.3.3 Issue #37 free-node semantics

- 上游 `komari-web` 约定确认：`price = 0` 不展示价格标签，`price = -1` 才显示免费；Issue 两个现象真实存在。
- 影响范围复核：`tagHelper.getRemainingValue` 仅被 NodeCard 调用；FinanceDetails 与 InstanceDetail 使用 `financeHelper.calculateRemainingValueCNY`，不能靠修改一个数值 helper 自动修复。
- 实施方案：引入统一免费节点判断；金额计算保持数字 0，NodeCard / FinanceDetails / InstanceDetail 在展示层输出“无 / N/A”；同步修正列表、对比面板和排除免费节点逻辑。
- 聚焦浏览器验证：首页卡片、排除免费开关、财务表和详情页流程 2.2 秒实际通过；Windows 系统 Chrome 完成用例后未自行退出，命令由外层超时终止。
- 本地验证：`bun run lint`、`bun run build`（含 `vue-tsc --build`）和 `git diff --check` 通过；未重复运行无关浏览器或完整视觉矩阵。
- 本地资产：`komari-theme-Glassmorphism-build-2cd56ce.zip`，7,584,641 bytes，SHA-256 `F669E4172869CC7A9B5C40CDFC98D360ACB46C57015EA763CDDB976BF489131E`；包内版本 3.3.3，共 771 个 entries，顶层为 `komari-theme.json`、`preview.png`、`dist/`。
- 发布完成：提交 `63a1d0166e7bf9ab4bb29b003f3549fcdeb5a27f` 已推送 main；Release On Version Bump run `30530144758` 和 Visual Regression run `30530144811` 均成功；tag / Release `v3.3.3` 指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-63a1d01.zip`，7,592,709 bytes，GitHub digest 与下载后 SHA-256 均为 `01a1d0111b0405f0ffaa280070d77e0dfe46bdd728edf0dbe7396a93be3ff249`；包内版本 3.3.3、771 个 entries 和顶层契约均正确。
- Issue 收尾：`#37` 已留言说明实现与验证结果，并以 completed 关闭。此最终交接状态只保留在本地 AICACHE，避免纯文档推送额外触发完整 Visual Regression。

### 2026-07-29 v3.3.2 Issue #36 metric icons

- 聚焦审查确认 Issue 合理且定位准确：`NodeCard.vue` 已使用 Iconify，但四项主指标标题仍是纯文字，mini 模式甚至仅显示 `C/M`；下方网速、累计流量、剩余价值已有图标，无需扩大范围。
- 图标语义复用详情页现有 Iconify 标识：`tabler:cpu`、`icon-park-outline:memory`、`tabler:server-2`、`tabler:arrows-transfer-up-down`；不新增依赖，也避免首页与详情页使用两套图标语言。
- 实施边界：普通卡片保持文字并添加装饰图标；mini 模式图标固定宽高并保留可访问名称；颜色只作视觉辅助，指标文字、图标形状和百分比仍共同传达含义。
- 聚焦浏览器验证：桌面亮色、移动暗色和 mini 卡片共 3 个用例实际通过；系统 Chrome 在 Windows 上完成用例后仍未自行退出，命令由外层超时终止，未重复运行完整视觉矩阵。
- 本地验证：`bun run lint`、`bun run build`（含 `vue-tsc --build`）和 `git diff --check` 通过；只运行了本次直接相关的 3 个浏览器用例，没有重复详情页或完整视觉矩阵。
- 本地资产：`komari-theme-Glassmorphism-build-9f13b72.zip`，7,584,520 bytes，SHA-256 `ACCFF5672075532F27062AD68BAA74C03D74A87261293E698FEB3C0F647894BD`；包内版本 3.3.2，共 771 个 entries，顶层为 `komari-theme.json`、`preview.png`、`dist/`。
- 发布完成：提交 `2cd56ceaad5eb0e292e2c70f7dc3be9cf4155158` 已推送 main；Release On Version Bump run `30452135059` 和 Visual Regression run `30452134859` 均成功；tag / Release `v3.3.2` 指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-2cd56ce.zip`，7,592,580 bytes，GitHub digest 与下载后 SHA-256 均为 `f2ef3697197abbf0b10ee09bd7be184051d66ac71770273ab687c65ebf0514cd`；包内版本 3.3.2、771 个 entries 和顶层契约均正确。
- Issue 收尾：`#36` 已留言说明实现和验证结果，并以 completed 关闭。此最终交接状态只保留在本地 AICACHE，避免纯文档推送额外触发完整 Visual Regression。

### 2026-07-29 v3.3.1 Issue #33 / #35 hotfix

- `#33` 根因确认：首页由 `KeepAlive` 保留后，节点卡片和列表的 `useNodePingStats` scope 不会销毁，因此每个 UUID 的 Metric Store 查询及 60 秒刷新订阅继续存在；卡片摘要还复用了完整图表的 6000 点上限。
- `#33` 修复：首页激活状态显式传到卡片/列表 Ping composable，离开首页立即释放订阅并中止 metric / legacy 在途请求；无订阅时不再进入 fallback；摘要查询上限独立降为 150。
- `#35` 修复：`financeHelper.calculateRemainingValueCNY` 和卡片 `tagHelper.getRemainingValue` 同步移除单周期封顶；超过 100 年的长期机兼容语义保持不变。
- 回归：新增 Playwright RPC 断言，覆盖首页摘要 `max_points=150` 及进入详情后 Ping metric 只包含当前 UUID。系统 Chrome 中用例 4.0 秒通过；Windows Chrome 完成测试后未自行退出，托管 Chromium 结果留待 GitHub Actions 最终确认。
- 数值：固定随机种子 `0x35c0ffee` 校验 10,000 组价格 / 周期 / 剩余天数，其中 9,727 组跨多个周期；两套计算入口全部通过，最大浮点误差 `7.450580596923828e-9`。
- 本地验证：3.3.1 版本下 `bun run lint`、`bun run type-check`、`bun run build` 和 `git diff --check` 已通过；聚焦 Playwright RPC 用例通过。按用户要求停止额外的完整视觉矩阵。
- 本地资产：`komari-theme-Glassmorphism-build-7d2c7e1.zip`，7,584,274 bytes，SHA-256 `F438AF4BDF12849983D206600A4C30025D64EF33ED47EBC330DA3E2458D039EB`；包内版本 3.3.1，顶层为 `komari-theme.json`、`preview.png`、`dist/`，包含 769 个 dist entries。
- 发布完成：提交 `9f13b72442944f9a99c808054fe8a0a18dd710c2` 已推送 main；Release On Version Bump run `30445113985` 和 Visual Regression run `30445114027` 均成功；tag / Release `v3.3.1` 指向该提交。
- 线上资产：`komari-theme-Glassmorphism-build-9f13b72.zip`，7,586,093 bytes，GitHub digest 与下载后 SHA-256 均为 `feadd4b3194aaacda719771584425c93dc8ffe3d70281fb0979e8a3d12c03e9f`；包内版本、顶层结构、预览图和 769 个 dist entries 均正确。
- Issue 收尾：`#33` 与 `#35` 均已分别留言说明修复和验证结果，并以 completed 关闭。此最终交接状态只保留在本地 AICACHE，避免纯文档推送额外触发完整 Visual Regression。

### 2026-07-16 exact Linux integration bundle

- 刷新上游状态：Komari #604 仍为 open，head `f08f47d6a7f5e4cdec28a1e89c2183f1c1b6e1fb`，前端及 Linux/Windows 构建矩阵全部成功；komari-web #82 仍为 open，head `0fee1f123009eca4b5f380549845bed756fa2d0c`。
- 发现旧本地 Komari 快照除默认主题外仍有 23 个换行归一化后的真实源码差异，集中在 Metric Store、迁移和启动流程，因此废弃旧二进制，不作为 PR 精确测试包交付。
- 从 GitHub 下载 `f08f47d` 原始源码，创建干净编译树；逐项比较 `cmd/database/pkg/protocol/utils/web` 共 243 个核心文件，排除有意替换的 `web/public/defaultTheme` 后差异为 0。
- 默认主题替换为已发布的 Glassmorphism `v3.1.8` 资产；包内配置名为“主题设置”，完整管理端来源记录为 komari-web `0fee1f1`，路由桥接覆盖 `/admin`、`/terminal`、`/manage/*` 并加载 `glass-admin.css`。
- 使用 Go `1.26.4`、Zig `0.14.1`、`x86_64-linux-musl`、`CGO_ENABLED=1` 和 `-buildvcs=false` 构建 Linux amd64 ELF；显式版本为 `integration-f08f47d-theme-v3.1.8`，版本哈希为完整 Komari PR head。
- `go test ./database/clients ./web/api/client ./web/rpc/jsonrpc` 在 Windows amd64 CGO + Zig 环境下通过；`go vet ./...` 通过；Linux 目标构建通过。
- 功能存在性清单确认：计费费率/锚点/下月到期/一次性开机费/流量重置保护/非阻塞上报，访客审计默认关闭/RPC/IP-UA 限流/UTF-8 截断/日志索引与 SQL 过滤，主题审计摘要及 JSON/CSV 导出，以及 Glassmorphism 默认前后台均进入交付包。
- 最终目录：`output/integration-test/final/komari-glassmorphism-integration-20260716/`；总包：`output/integration-test/final/komari-glassmorphism-integration-20260716.zip`，32,089,492 bytes，SHA-256 `02f896751dfb87ff1a4a144ca69c3f9bfd83376de54492ba2013918f51c6c873`。
- 二进制 SHA-256 `a966d695e4d3b84496567465ed8bf7a585459656bf756a1e50616ff21b3578ae`；主题 zip SHA-256 `f4dd86ad26a9a55ebfcecc1c76ac07cdcd5fcfd1883cf608ec4e7f491388ea26`；独立后台 zip SHA-256 `e17fa820a4a2d184541f068bc996dea70ffa3bb6502be102dad902b1bd599f6d`。
- 未包含：每日/每周主题更新提醒、自动安装主题、不可篡改账本；实时费用仍是 fork 实验性估算功能。运行态数据库迁移、真实 Agent 上报和登录浏览器联调等待用户在 Linux 测试机部署。

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

## 2026-07-15 v3.1.8 published

- Release commit: `a52572aea7631239e1c35a47283c74a744a9911d`.
- GitHub Actions run `29430366028`: success.
- Release: `https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases/tag/v3.1.8`.
- Published asset: `komari-theme-Glassmorphism-build-a52572a.zip`, SHA-256 `f4dd86ad26a9a55ebfcecc1c76ac07cdcd5fcfd1883cf608ec4e7f491388ea26`.
- Downloaded asset verification passed: manifest `3.1.8`, configuration name `主题设置`, `preview.png`, and `dist/index.html` are present.

## 2026-07-16 v3.1.9 release candidate (M4/M5/M6)

- Removed all theme/runtime dependencies on experimental Komari #604 and komari-web #82 fields. The embedded admin is rebuilt from official komari-web `radix` commit `ebfbd3e079f8777a746276fe67429b519024f7c7`; the integration core is upstream Komari `43547b947ff82b4b899452ead7ba7b1517ba1f84` and does not contain #604.
- Added a per-node frontend usage estimator under `theme:usage-estimator:v1:<node_uuid>`. It uses a frozen cumulative traffic snapshot, manual billable hours, a one-time estimate-only add-on, explicit source/display currencies, TiB units, finite non-negative bounds and a clear non-billing disclaimer.
- Reworked the value dialog into fixed-value, metered-estimate and exchange-rate sections. Rate source/update time is visible; missing exchange rates are not silently treated as 1; local settings can be cleared.
- Synced the complete official admin app and rewrote root-relative flag/OS assets for `/admin-app/`. The sync script injects the route bridge and hash-busts `glass-admin.css`; the CSS applies stronger cyan/mint/lilac glass styling while avoiding per-card backdrop filters on dense tables.
- Fixed the embedded-default identity mismatch that caused Theme Management to request an uninstalled `/themes/Glassmorphism` directory. Integration packages normalize the embedded manifest short name to `default`; the release theme remains `Glassmorphism`.
- Added safe persistent background resolution: `local:path` maps to `/themes/user-assets/<encoded path>` and rejects `.`/`..`. Administrators should store files under Komari `data/theme/user-assets/`, outside replaceable theme packages.
- Added the compact header advanced-tools toggle, removed the monthly-cost quick filter, changed the authenticated visitor label to `尊敬的管理员`, hid the detail visitor card below `2xl`, and retained the bottom IP pill.
- Constrained the standard earth canvas and increased the header band height so the globe no longer overlaps controls or the first node row at 1280px. Ping gaps now say `无采样数据` instead of `N/A`.
- Browser verification on `https://mt.vpnmiao.com/`: 390x844 and 1280x720 had no document overflow; the visitor detail card stayed hidden; globe/list boundaries were visually clean; `/admin`, `/admin/settings/theme`, `/admin/theme_managed` and `/terminal` loaded; Theme Management had no 404; admin images had no broken resources; console had no new warnings/errors.
- Integration validation: `go test ./database/clients ./web/api/client ./web/rpc/jsonrpc` and `go vet ./...` passed. Linux amd64 CGO/static build succeeded and was deployed for live testing. The test host was cleaned to the active binary/data only, with no backups retained per operator request.
- Release guardrail: do not reintroduce #604/#82 into the theme release or new upstream PRs. Komari default-theme work must be a clean branch from upstream main; komari-web asset-path work must be a clean branch from upstream radix.

## 2026-07-16 v3.1.9 published and upstreamed

- Release commit `f17a5eb7c18138fba78d22504e1ed5b19b347284`; workflow `29492624741` succeeded; Release `v3.1.9` points to the same SHA.
- Published asset `komari-theme-Glassmorphism-build-f17a5eb.zip`, SHA-256 `aab1572006c02447461410422962d5c65c569c6429a0191a74e6ee5544eaff9b`. Downloaded verification passed for version, `Glassmorphism` short name, `主题设置`, preview hash, `dist/index.html`, embedded admin index, admin source SHA and absence of #604 fields.
- Komari fork branch `codex/glassmorphism-default-theme`, commit `7b64db3c403f05f6dfbcb603ae4763c8842442a8`, upstream PR `komari-monitor/komari#606`. It pins Glassmorphism `v3.1.9`, builds with Bun, normalizes the embedded manifest to `short: default`, and tests metadata preservation. PR CI run `29493915098` passed frontend plus all seven Linux/Windows binary jobs.
- komari-web fork branch `codex/base-aware-static-assets`, commit `2ff6c2be70ac12a641ac7272cdfed1995439d58a`, upstream PR `komari-monitor/komari-web#83`. It resolves flag and OS images from Vite `BASE_URL`; lint has 0 errors/27 existing warnings, and both root and `/admin-app/` production builds pass.
- The admin sync script accepts both legacy root-relative komari-web assets (rewritten after build) and #83-style native BASE_URL assets (already correct). Do not restore the old requirement that at least one root-relative path must be rewritten.

## 2026-07-16 default-theme updater and globe follow-up (M4/M5/M6)

- In progress: paired clean upstream PRs add writable updates for Komari's embedded `default` theme. Core changes use `data/theme/default` as an atomic overlay and retain the binary-embedded theme as fallback; komari-web exposes the update action and explains the fallback behavior.
- Core regression coverage includes successful default installation, manifest normalization, preservation of the previous overlay after an invalid archive, safe local asset lookup, and rejection of traversal paths.
- Globe regression found in v3.1.9: the normal header was raised from the established `md:h-58` layout to `md:h-72` and the globe column gained forced height/clipping. Those three layout classes are being restored to the v3.1.8 implementation; renderer selection remains configurable and `realistic` remains the default.
- Cross-renderer browser verification found and fixed a tiled-map scoped-CSS regression: `:global(.dark) .child` compiled to bare `.dark` selectors, applying map image opacity/filter rules to the entire document. The selectors now wrap the complete descendant selector in `:global(...)`.
- Browser checks use the real 47-node test dataset. Realistic renders at about 475px desktop / 369px mobile after the original layout restoration; Cobe renders at 448px / 348px; tiled mode keeps its 672px mobile map inside a 356px horizontal scroll container with no document overflow.
- v3.2.0 validation: `bun run lint` and `bun run build` passed; the local archive contains manifest version `3.2.0`, `preview.png`, and `dist/index.html`. Browser checks covered all three earth renderers on desktop/mobile and home -> detail -> home. The only build warnings are the existing VueUse annotation and large globe chunk notices.
- Default-theme updater validation: `go test ./web/api/admin ./web/public` and targeted `go vet` passed. A broader `go test ./web/...` reached unrelated SQLite-backed packages and failed because the local Go binary uses `CGO_ENABLED=0`; do not treat that environment failure as a regression in these packages.
- komari-web updater UI: i18n sync is clean, lint reports 0 errors / 27 existing warnings, and both root-base and `/admin-app/` production builds pass.

## 2026-07-25 metric tags, node search and CPU estimate follow-up (M4/M6)

- Komari main commit `d853a83e` removed the deprecated public metric `tag` alias; current responses use `tags`. Keep the theme's legacy `tag` type and fallback for transitional 1.2.x cores, but merge in `labels -> tag -> tags` order so canonical `tags` always wins conflicts.
- Komari 1.2.5 does not expose `public:queryMetrics`; detail and Ping history must retain the existing `getRecords` / `getPingRecords` fallback. Do not make MetricSeries support a hard requirement.
- Metric tag identity keys now use sorted JSON tuples instead of delimiter-joined strings, avoiding collisions when tag values contain `|` or `=`. Normalized series clear the legacy `tag` alias after canonicalizing it into `tags`.
- Home search moved to `utils/nodeSearch.ts` and now covers node name, UUID, region, groups, tags, OS/kernel, virtualization/architecture, public metadata, CPU/GPU model and available IPv4/IPv6 values. IPv4 octet wildcards such as `192.168.x.x` and `192.168.*.*` are supported. Guest search cannot expose private IPs because Komari omits them from the public node payload before the theme receives it.
- The local S/A/B CPU heuristic was discarded after review because model-family rules cannot provide a credible performance ladder. Detail pages now generate a small external PassMark CPU Mark lookup link from the reported model; benchmark data and ranking stay with PassMark and are not copied into the theme.
- Komari snapshot `c7819cd9` adds public Ping task `weight`. The theme accepts it as optional and orders metric Ping lines by `weight -> id`; old cores without weight remain compatible and fall back to numeric task ID ordering.
- Mobile visitor bar now hides while actively scrolling and returns 700 ms after scroll idle; its mobile layout hides the redundant `Your IP:` label and truncates long IPv6 values. Back-to-top appears only after 320 px, uses a smaller mobile button above the visitor bar, and no longer uses a modal-level `z-index`.
- Validation: `bun run lint`, `bun run build`, and `git diff --check` passed after all changes. Behavior smokes passed for `tags` precedence, collision-safe metric keys, Ping weight ordering, fuzzy IPv4/IPv6 and CPU text search, and PassMark model normalization/link generation. The required theme archive layout remains intact; only the existing VueUse annotation and large globe chunk warnings remain.
- CPU benchmark data remains external: PassMark does not expose a browser CORS API and its downloadable benchmark data is licensed, so do not reintroduce guessed local grades or scrape the site from the theme. The lookup action now sits at the CPU card's top-right and opens the normalized model query directly.
- At the maintainer's request, CPU detail also shows a clearly labelled local approximate model tier. The ordered classifier covers common EPYC/Xeon/Ryzen/Core/Threadripper/Apple Silicon/Ampere/Graviton/Neoverse and low-power/legacy families without embedding proprietary scores. Preserve the established labels (`旗舰服务器级`, `高端消费级`, `云原生 ARM 级`, etc.); only the underlying model-generation data should evolve. Keep the tooltip disclaimer: this is a model-generation reference, not a benchmark of the node's allocated vCPUs.
- Disk prediction subtitles are intentionally compact (`预计 N 天后满`, `暂无趋势`, `样本不足`, `趋势积累中`) to avoid wrapping over the chart on narrow viewports.
- CPU tier samples were checked across EPYC 7551/7B13/9654, Xeon E5 v4/Gold 6133/Platinum 8480+, Core i9-14900K, Ryzen 9950X, Ampere Altra Max, Intel N100, KVM64 and an unknown model. Final `bun run lint`, `bun run build`, and `git diff --check` passed; the test archive remains `komari-theme-Glassmorphism-build-ce11932.zip`.
- CPU rating presentation keeps the established unframed row under the model (`tier + thin bar + label`). Only the external CPU Mark action belongs in the card header; do not turn the tier into a top-right badge.

## 2026-07-25巡检效率与大规模节点优化（M2/M4/M5）

- 超过 30 台节点时，卡片模式使用 `DeferredRender` 在视口前后 700px 内按需挂载 `NodeCard`，未挂载区域保留按卡片密度计算的稳定高度；列表模式继续使用既有虚拟列表。
- 收藏节点保存在站点隔离的 `theme:favorite-nodes:v1`，卡片、列表与详情页均可切换星标；首页快捷控制新增 `favorite`。运行时会清洗损坏的本地存储值。
- 详情页头部新增收藏、上一台、下一个和下拉节点切换器，继续使用公开可见节点列表，不引入新接口。
- 首页工具新增公开的实时节点对比，最多选择 4 台，支持按名称/IP/CPU 搜索，显示 CPU、内存、磁盘、网络、流量、运行时间和按隐私设置降级的价格；选择保存在 `theme:node-compare:v1`。
- 健康摘要在现有历史请求结果上派生综合异常排行，合并离线、CPU、内存、磁盘、流量、Ping 和磁盘耗尽风险，不增加重复请求。
- 明确排除：不做地球自动画质，也不增加 CPU 天梯规则的在线维护功能。
- PR #29 (`7e582c2`, merged as `9c9a7ee`) restores PWA metadata. Local integration preserves its iOS standalone intent and manifest retention, then hardens it: the root theme links the manifest, Apple touch uses the existing 512px PNG, and `sync-komari-admin.ts` parses manifest JSON to rewrite `/assets/` icons under `/admin-app/assets/`. Service worker files remain intentionally removed to avoid stale admin assets after route bridging.
- Final test package validation passed: `bun run lint`, `bun run build`, and `git diff --check`; `dist/index.html` links `/admin-app/manifest.json` and `/admin-app/assets/pwa-icon.png`, all manifest PWA paths resolve inside the archive, and the output remains manifest version `3.2.0`. After removing the redundant default quick control, test zip SHA-256 is `DF72FC12C4B57C59482A24F28793C1C9B7E7874205F21E410DC87BE487B5610D`.
- Quick controls no longer render a redundant `默认` item or expose a default-filter setting. No active filter means all nodes; clicking a filter selects it, clicking it again clears it, matching the advanced-tool toggle interaction. Legacy `default` keys are ignored during normalization.

## 2026-07-25 online browser verification follow-up (M2/M4)

- The uploaded 54-node build passed desktop checks for toggleable quick filters, favorites, four-node comparison limits, detail previous/next/select navigation, normalized CPU Mark links, compact disk trend text, and document-width containment.
- Node comparison no longer preselects two nodes. Its empty state previews every available comparison field, while persisted explicit selections remain supported.
- Fixed a dynamic-enable gap in `DeferredRender`: when the node list initially starts below the 30-node threshold and later grows above it, offscreen cards are now suspended after a viewport-distance check instead of remaining mounted. A requestAnimationFrame-throttled scroll/resize fallback covers browsers without `IntersectionObserver`.
- First uploaded-build verification proved the component-level watcher alone was insufficient: the initial data injection still retained 54 already-mounted cards, while toggling a quick filter remounted the same grid with only 16 near-viewport cards. The node wrapper key now includes the deferred/full mode so crossing the 30-node threshold deterministically recreates wrappers in deferred mode.
- Second uploaded-build verification reduced the desktop first mount to 20 cards plus 34 stable placeholders with no horizontal overflow. Its scroll reveal still stalled in the in-app browser, whose page environment did not expose `IntersectionObserver` or `requestAnimationFrame`; the fallback scheduler now uses a 16 ms window timer when animation frames are unavailable.
- Deferred cards now use a hybrid reveal policy: the viewport and its 700px buffer mount first, scrolling prioritizes newly-near cards, and staggered idle timers progressively mount the remaining cards over roughly 1–5 seconds even when the user does not scroll. Each timer is cleared after an early reveal or component teardown.
- Final live verification on `https://mt.vpnmiao.com/` loaded the expected `index-Cq7ioLuk.js` asset. Desktop remount measured 16 cards at 0/500 ms, 26 at 2.3 s and all 54 at 5.1 s; a rapid 1800px scroll raised the mounted set from 16 to 40 within 200 ms. Mobile 390x844 measured 4 cards initially and all 54 by 5.3 s, with `scrollWidth === clientWidth` on both breakpoints.
- The comparison panel opened at 0/4 with all comparison metric labels previewed. Weekly health generation returned an immediate realtime summary, completed the capped 6,000-sample history pass in about 8 seconds, and populated composite anomaly, CPU, memory, disk-growth, traffic and Ping findings. The final browser console contained no warnings or errors.

## 2026-07-25 visual regression automation (M6)

- Goal: add deterministic Playwright screenshot regression coverage without adding any runtime theme feature or real-site dependency.
- Planned fixture coverage: long node names, IPv4/IPv6, Swap, offline/high-load/traffic-warning states, fixed prices and fixed timestamps. Network responses are mocked in Playwright; fixture data must not enter the release zip.
- Planned baseline matrix starts intentionally small: desktop/mobile home, desktop list, desktop detail, dark/color-vision home and one alternate earth renderer. GitHub Actions must upload actual/diff artifacts on failure.
- Implemented 7 deterministic Playwright baselines: light desktop home, dark mobile home, accessible desktop list, Cobe and tiled earth layouts, light desktop detail and dark mobile detail. All use mocked Komari API/RPC/visitor data, fixed time, disabled animations and hidden dynamic 3D canvas pixels while retaining globe layout boundaries.
- First baseline generation and repeated comparison both passed 7/7 with system Chrome. Windows system-channel Chrome did not exit cleanly after reporting results, so release validation does not treat that local channel teardown as a product failure; CI installs and runs Playwright's managed Chromium.
- Added the independent `Visual Regression` workflow for pull requests and `main`, with actual/diff/HTML report artifacts retained for 14 days on failure. Release target is v3.3.0.

## 2026-10-14 issue 61 / 60 (M4)

- issue 61 ping 延迟曲线波动幅度不协调：根因是 `PingChart.vue` 与 `MetricSeriesChartCard.vue` 的 `yAxis` 未固定量程，ECharts 自动缩放把 1ms 与 50ms 波动都拉满整幅图。新增 `src/utils/pingChartAxisScale.ts`，按数据自身量级计算稳定基线：跨度取 `max(实际跨度, 10ms, 基线值×20%)`，补出的余量平分两侧使小幅波动居中，再对齐 nice step；1ms 波动约占 8% 高度、50ms 波动约占 57%，比例差异可辨。
- 同时按 issue 反馈把延迟曲线调圆润：ping 弹窗图 `smooth` 由 `cutPeak ? 0.6 : 0.1` 改为 `cutPeak ? 0.5 : 0.35`，并加 `smoothMonotone: 'x'` 钳制过冲；`MetricSeriesChartCard` 仅对 `milliseconds` 系列启用 `smooth: 0.35` + `smoothMonotone: 'x'`，其他指标保持 `smooth: false` 不受影响。
- issue 60 地球 IP 位置：新增 `src/utils/ipGeoProviders.ts` 与 `ipGeoProviderIds` 主题设置项（richtext），默认 `ip.sb / ipinfo.io / ipwho.is / ipapi.co`，可自行删减或调整优先级。语义区分明确：未配置沿用默认链；显式留空（空数组）时 `useNodeGeoClusters` 跳过整轮在线查询，地球只按后台 region 定位，与节点卡片国旗一致；写成非法字符则回落到默认链而非静默关闭。`ipGeoHelper.setIpGeoProviderOrder()` 保留原有轮询起始、失败退避与 localStorage 缓存行为。
- 未采纳新增 tags 隐藏开关：该 issue 的 tags 部分用户本次未要求，按范围控制仅做 IP 库选项。
- 验证：`bun run lint` 与 `bun run build` 均通过。

## 2026-10-14 issue 60 follow-up: tags switch and editable IP lookup URLs

- Re-read issue 60 after the reporter added comments with screenshots. Their detail confirms the original reading rather than changing scope: Komari backend tags cannot be hidden from the theme, and their card showed India (ip-api.com in backend) while the globe plotted elsewhere because the theme queries its own IP databases. No change to the approach.
- Frontend tags switch: new `nodeTagsVisible` theme setting, default false. It gates custom tags on NodeCard, NodeList and InstanceDetail uniformly so the frontend stays clean while the Komari backend node editor still shows and maintains tags. The pre-existing `nodeListCustomTagsVisible` list-only switch is now superseded inside NodeList by the unified switch; its manifest entry is kept for backward compatibility.
- IP lookup is now a free-form editable URL list rather than a fixed provider whitelist. New `ipGeoProviderUrls` richtext setting, one URL template per line with `{ip}` placeholder. The four built-in services keep their dedicated response parsers (matched by exact URL), and any other address falls back to a generic parser accepting latitude/longitude, lat/lon/lng, or `loc: "lat,lng"` plus optional city/country_code/org/asn. This lets the owner point the theme at a self-hosted geo API without a theme release.
- Semantics unchanged from the first pass: unset falls back to the built-in chain, explicitly blank disables online lookup so the globe uses the backend region only, and fully-invalid input falls back to the defaults rather than silently disabling geo lookup.
- Not addressed: no self-hosted geo endpoint exists in this repo, so the shipped default is still the four public services. If the owner has a private endpoint, it only needs to be pasted into the setting.
- Validation: `bun run lint` and `bun run build` both pass.

## 2026-10-14 v3.4.2 release prep (M4, issues 60 and 61)

- Sparkline path was the missing piece for issue 61. The reported "新版" is the三网新版样式 card sparkline, not the detail chart. `src/utils/sparklinePath.ts` had the same auto-scaling domain problem plus a `linearPath` built from straight `L` segments with no smoothing at all, which produced the reported sharp spikes.
- `robustDomain` now follows the same rule as the detail-page latency charts: span = max(actual span, 8ms, magnitude x 20%) with the padding split evenly so small wobbles sit mid-chart. Measured at a 100ms baseline, a 1ms wobble occupies 5% of the height versus 100% for a 50ms wobble.
- Curve is now a horizontal-anchor cubic Bezier (Catmull-Rom to Bezier). Anchor tangents are pinned horizontal, so the curve provably cannot overshoot between samples or exceed adjacent sample values. Gap preservation and the single-point horizontal stub are unchanged.
- Verified the shipped zip rather than trusting the build: manifest inside the archive carries `nodeTagsVisible` default false and `ipGeoProviderUrls` with the four built-in endpoints, and the bundled chunks contain the runtime logic (`nodeTagsVisible` in NodeCard/NodeList/InstanceDetail, `ipGeoProviderUrls` in NodeGeneralCards/useNodeGeoClusters/useNodeGeoLookup, `smoothMonotone` in PingChart/LoadChart/echarts).
- Version bumped to 3.4.2 to trigger the release-on-version-bump workflow.

## 2026-10-14 v3.4.2 README update (M6)

- README bumped to v3.4.2 with a new feature section covering both fixes: the latency axis calibration and the horizontal-anchor Bezier sparkline smoothing for issue 61, and the shared geo lookup plus editable data source list and the nodeTagsVisible switch for issue 60.
- Theme settings table now lists the two new keys so admins can find them: 地球 IP 查询地址 under 首页布局, 前台显示节点标签 under 快捷控制与列表.
- Added a matching v3.4.2 entry at the top of the changelog section.
- Release state at this point: v3.4.2 published as commit 69878cb, asset SHA-256 DFAFAF3F8D24E5D9E52BF71DB2BA7C44FA74E9AB87E2EF767721A9F760B4CB8D, verified by re-downloading the asset and checking manifest version plus bundled chunk contents. All three workflows succeeded and issues 60 and 61 were closed.

## 2026-10-14 README deduplication (M6)

- README had the same version history twice: per-version sections at lines 51-293 and a second "更新日志" changelog at lines 560-769. Together roughly 450 of 813 lines, about 60% of the file, were duplicate release notes.
- Kept full detail for the three most recent versions (v3.4.2, v3.4.1, v3.4.0) since those describe current behavior, and compressed v3.3.8 through v3.1.0 into a single "历史版本速览" list pointing at GitHub Releases and AICACHE.md for full history.
- Verified nothing was lost: all 20 non-version functional sections are present and unchanged, all 15 key links survive (including Komari PR 604/602 and komari-web PR 82, which I initially dropped and had to restore), code fences still pair evenly, and section separators are intact.
- Chose a bullet list over a table for the history because prettier stretches table columns to the longest cell, which pushed the table to 200+ characters per line.
- Result: 813 lines down to 432, a 47% reduction. lint passes.

## 2026-10-20 Issue 62 investigation (M6; proposed fix M4)

- Scope: investigate the deleted Ping task selection report; no runtime code or release changes.
- Current public Issue #62 is open with no comments. Remote main is `fa48ccd5d6698803a698c1427d2f51cb720eff4b`, matching the inspected local HEAD.
- Root cause: `useThreeNetPingSettings` copies saved node/global IDs without reconciling them with the task catalog. `activeTaskIds` and the three-task limit include deleted IDs, while `ThemePingSettings` renders checkboxes exclusively from the existing task catalog. Unknown IDs get a summary fallback name but no removal control. Saving parses valid positive IDs without checking catalog membership, so unrelated edits do not remove the stale binding.
- Verification: executed the actual composable after TypeScript transpilation with mocked stores/catalog and Vue refs/computed. Saved `[30,7,10]` against catalog `[30,10,20]` gives two visible checks but 3/3 occupied, blocks adding 20, and leaves `[7]` after unchecking both visible selections. The global selector has the same blockage. No backend requests or settings writes were made.
- Suggested repair: expose missing selected IDs with an explicit remove control for both node/global settings; allow removal even when the catalog is empty, and persist through the existing permission-checked merge service. Avoid treating catalog request failure or a search-filtered list as proof of deletion. Temporary workaround: remove only the deleted ID from the affected UUID entry in `threeNetPingNodeTaskBindings`; also inspect `threeNetPingTaskIds` if global bindings were used.
- Validation: no lint/build run because this was a read-only runtime investigation plus handoff documentation. No GitHub comment, issue closure, commit, push or release performed.
