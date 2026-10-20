<div align="center">

# 🌌 Komari Glassmorphism

## 给 Komari Monitor 的一套「玻璃拟态 · 运维驾驶舱」主题

从好看的监控首页，逐步成长为好用、可配置、适合长期运行的 Komari 主题。

![Version](https://img.shields.io/github/v/release/sanrokamlan-prog/komari-theme-Glassmorphism?style=for-the-badge&label=release&color=10b981)
![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Bun](https://img.shields.io/badge/Bun-%3E%3D1.2-000000?style=for-the-badge&logo=bun)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**[📥 下载 Release](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)** ·
**[🚀 安装](#-安装--升级)** ·
**[✨ 功能](#-节点详情页全面升级)** ·
**[⚙️ 设置](#️-主题设置)** ·
**[🛠️ 开发](#️-本地开发)**

</div>

---

## 📸 预览

<div align="center">

<img src="docs/preview.png" width="80%" alt="Komari Glassmorphism 可配置能力概览" />

</div>

---

## 🚀 项目定位

| 项目     | 说明                                                      |
| :------- | :-------------------------------------------------------- |
| 当前版本 | **v3.4.3**                                                |
| 主题定位 | Komari Monitor 可导入 zip 主题，不是普通 Web App 部署包   |
| 视觉风格 | 毛玻璃卡片、动态背景、浅色 / 深色 / 北京时间自动日夜模式  |
| 数据能力 | Metric Store 优先，旧接口自动 fallback，兼容 Komari 1.2.x |
| 高级工具 | 拓扑、性价比、健康摘要、快照导出、访客安全审计            |
| 发布产物 | `komari-theme-Glassmorphism-build-<short-sha>.zip`        |

> 好看只是外壳。v3 真正的重点，是把 Metric、Ping、流量、费用、健康分析和运维工具整合成日常真的会打开来看的监控面板。

---

## 📡 v3.4.3 · 已删除 Ping 任务可移除

- 修复 Issue [#62](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/62)：后台删除 Ping 任务后，旧绑定仍占用名额、却没有取消入口。全局和按服务器任务编辑器现在会列出不在当前任务列表中的已选 ID，可逐个移除并保存，再选择替代线路。
- 任务列表为空或加载失败时仍可移除旧绑定；搜索不会隐藏移除入口，也不会自动清空原有配置。保存继续验证管理员身份并保留其他节点和无关设置。

---

## 📡 v3.4.2 · 延迟曲线比例校准与地球 IP 对齐

- 修复 Issue [#61](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/61)：延迟曲线的纵轴此前完全交给自动缩放，任何数据都会被拉伸填满绘图区，于是 1ms 波动和 50ms 波动渲染出的像素高度几乎一样。现在按数据自身量级计算稳定基线（跨度取 `max(实际跨度, 10ms, 基线值×20%)`，补出的余量平分两侧使小幅波动居中）。100ms 基线下，1ms 波动约占 8% 高度，50ms 波动约占 57%。
- 节点卡片的三网小曲线此前由直线段拼接、完全没有平滑，尖锐感即来源于此。现改为水平锚点的三次贝塞尔曲线，锚点切线固定水平，因此不会在采样点之间过冲；空数据断点和单点补横线的行为保持原样。仅延迟类图表受影响，CPU / 内存 / 流量等指标曲线未改动。
- 修复 Issue [#60](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/60)：节点卡片国旗此前读后台下发的 `region`，地球读主题自己查询的 IP 库，两套数据源不一致，同一节点可能显示不同国家。现在把 IP 地理位置查询提为共享数据，卡片国旗与地球落点取自同一次查询结果，失败时才回落到后台 `region`。
- 新增主题设置项 **地球 IP 查询地址**（第 02 节）：每行一个地址，按顺序回退，`{ip}` 替换为节点 IP，默认填入项目原有的四个数据源。可自行增删改或换成自建接口 —— 内置地址走各自的专用解析器，其他地址走通用解析，认 `latitude/longitude`、`lat/lon/lng`、`loc: "lat,lng"` 及可选的 `city` / `country_code` / `org` / `asn`。
- 新增主题设置项 **前台显示节点标签**（第 05 节），默认关闭：统一控制卡片、列表和详情页是否显示自定义标签，Komari 后台节点编辑页仍可正常查看和维护。
- 查询地址留空时地球与卡片都直接采用后台下发的地区数据；填入无法识别的内容则回落到默认链，不会因笔误静默关闭定位。
- lint、类型检查和主题打包通过；Release On Version Bump、Code Quality 和 Visual Regression 三个工作流全部成功。

---

## 📡 v3.4.1 · 下游三网布局与任务设置

- 直接移植 towersip 的小曲线共享列宽、行高、状态配色、名称缩写和历史浮窗；compact 卡片只自然增高 24px。
- 三网与新版样式使用独立开关，移植全局和按服务器的任务勾选编辑器；保存前验证管理员并保留其他配置。
- 修复 Ping 统计浮窗、小提示、非选中标签和未显示任务的文字对比度。
- lint、类型检查和主题打包通过；完整浏览器回归 **42/42**。

---

## 📡 v3.4.0 · 三网小曲线与兼容性优化

- 修复 Issue [#59](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/59)：弹窗内任务提示保持可见并避让屏幕边缘。
- CPU / 负载、进程补齐图例，统一所有指标卡片图例、图标尺寸和水平对齐；手机头部、弹窗和安全区同步适配。
- 公共 Ping 任务缓存与共享刷新减少重复请求，后台 / 离线暂停，恢复后刷新；实时状态继续更新。
- 地球在 WebGL 不支持、初始化失败或上下文丢失时自动显示平铺地图；城市定位过滤非公网 IP 和无效坐标，支持 IPv6 回退并丢弃过期查询结果。访客仍可看国家地图，外部城市查询遵循登录权限。
- 手机任务提示支持再次轻点关闭，滑动 / 长按不误开。Ping 增加 7 / 15 / 30 天快捷范围，按后端保留时间显示，保留原 6 / 12 小时。
- 新增 **分组标签显示节点数量**（同在设置第 05 节），默认关闭，计入离线节点、多分组节点分别计数，访客不统计隐藏节点。

### 可选首页三网小曲线（A4）

在后台 **主题设置 → 05 · 节点卡片、列表与快捷控制** 开启 **显示三网延迟（A4）**，选择线路，再开启 **三网新版样式**。两个开关默认关闭，卡片默认尺寸仍为 compact。

- 每张卡片显示最多三条线路的名称、最近探测延迟、历史曲线和丢包率。没有实时值时使用历史平均值；负延迟显示“不可达”。
- 鼠标悬停或手机轻点曲线查看历史时段；手机滑动仍可滚动页面，点外部收起。键盘左右方向键也可选点，Escape 关闭。点击线路名称打开完整 Ping 图表。
- **三网延迟任务** 可选择 1～3 个任务，按选择顺序展示；没有选择时恢复总览。兼容后台返回的数字数组、JSON 字符串及旧的 `20,10,30` 格式。旧后台若将 `pingtasks` 显示为文本，可通过下方首页编辑器直接勾选，无需输入 ID。
- 登录管理员后，点击首页顶部 **按服务器配置 Ping 任务**：可勾选全局任务或每台服务器的任务，同时切换三网和新版样式。节点绑定优先于全局，取消该节点全部选择后恢复全局。保存会验证登录，并合并最新配置、保留其他节点及无关设置。
- 新版样式直接移植 towersip 的共享网格列、16px 小曲线、20px 行高、状态色和名称缩写。卡片宽度及列数沿用原尺寸设置，三条曲线在 compact 下仅比默认卡片增高 24px；关闭新版样式可使用下游的三组延迟 / 丢包方柱。
- 曲线复用首页最近一小时的 Ping 摘要历史，以最多 20 个时段显示平均延迟和丢包；缺测保留断线，未记录历史时仍可显示实时值。

本次同时改进公共任务缓存、后台暂停刷新、手机安全区与详情头部布局，以及图例对齐、同名任务图例和浮窗文本转义。来源、取舍与验证见 [融合记录](docs/fork-integration-2026-10-12.md)。

---

## 📜 历史版本速览

完整逐版记录见 [GitHub Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases) 与 [AICACHE.md](AICACHE.md)。

- **v3.3.8** — 详情页与财务选择器改用主题 Select，修复暗色弹层（[#56](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/56)）
- **v3.3.7** — 累计流量历史改按时间桶末值展示，不再被平均降采样压低
- **v3.3.6** — 平铺地图读取与球形地球相同的总览卡片配置；新增 Code Quality 工作流
- **v3.3.5** — 详情页 Ping 任务顺序与后台排序一致
- **v3.3.4** — 到期剩余 5 天标红、6–10 天标黄；短时历史 CPU 自动回退旧接口
- **v3.3.3** — 免费节点文案与剩余价值口径统一（[#37](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/37)）
- **v3.3.2** — 节点卡片指标标题增加线性图标，mini 卡片改用固定尺寸图标
- **v3.3.1** — 首页离开即释放 Ping 查询；修复提前续费剩余价值被封顶（[#35](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/issues/35)）
- **v3.3.0** — 大规模节点巡检：搜索、收藏、节点对比、健康摘要、延迟挂载与 7 场景视觉回归
- **v3.2.0** — 恢复地球尺寸，修复平铺地图暗色样式污染整页
- **v3.1.9** — 内嵌官方管理端；新增按量费用估算器与 `local:` 持久背景
- **v3.1.8** — 修复 Swap 悬浮提示被卡片裁剪
- **v3.1.7** — 修复路由只剩背景；完整卡片方案显示全部指标；内嵌管理端升级
- **v3.1.6** — 官方管理端亮暗色覆盖；延迟 / 丢包格可打开完整图表；访客审计导出。提前适配 [Komari PR #604](https://github.com/komari-monitor/komari/pull/604) 与 [komari-web PR #82](https://github.com/komari-monitor/komari-web/pull/82) 的流量单价、小时单价与首次开机费锚点
- **v3.1.5** — 色觉辅助配色（安全色 + 纹理 / 线型 / 文字）；访客安全审计，提前适配 [Komari PR #602](https://github.com/komari-monitor/komari/pull/602) 的可信来源 IP 与操作记录
- **v3.1.4** — 首页丢包时间格改按各任务样本数加权，不再被整段平均值覆盖
- **v3.1.3** — 减弱动画下的路由过渡不再丢失 DOM 锚点
- **v3.1.2** — 启动链拆分为独立并行初始化，单项失败不再拖垮整个应用
- **v3.1.1** — 首页、列表与公开 Ping 修复
- **v3.1.0** — 节点详情 Metric 驾驶舱上线

---

## ✨ 节点详情页全面升级

主题已适配新版 Komari / komari-web Metric 能力，并将官方指标重新整理成适合监控场景的图表族。

| 分类        | 支持指标                                                       |
| :---------- | :------------------------------------------------------------- |
| 💻 CPU      | CPU、Load、Processes                                           |
| 🧠 内存     | RAM、RAM Total、Swap、Swap Total                               |
| 💾 存储     | Disk、Disk Total、磁盘耗尽预测                                 |
| 🚀 GPU      | GPU、GPU Device、GPU Memory、GPU Memory Total、GPU Temperature |
| 🌐 网络     | Download、Upload、周期流量、累计流量、TCP、UDP                 |
| 📡 网络质量 | Ping Latency、Packet Loss、多任务统计                          |
| 🌡️ 环境状态 | System Temperature、GPU Temperature                            |

> 不是简单堆叠 25 张单指标图，而是归并成 12 个稳定图表族，减少碎片化信息和无意义的重复展示。

### 📐 详情页布局

| 优化方向 | 当前能力                               |
| :------- | :------------------------------------- |
| 概览卡   | 18 类指标，7 套预设                    |
| 图表面板 | 12 个图表族，9 套预设                  |
| 响应式   | 移动端 2 列、中屏 3 列、宽屏 4 列      |
| 分区模式 | 可选概览 / 负载 / 延迟标签页           |
| 兼容配置 | 保留旧图表 key、旧卡位和 JSON 模板解析 |

---

## 🎨 详情页自定义能力

主题设置不要求修改源码。预设适合快速启用，英文 key 适合高级用户精确控制顺序和内容。

| 功能                | 状态 |
| :------------------ | :--- |
| 概览卡预设          | ✅   |
| 图表预设            | ✅   |
| 英文 key 自定义     | ✅   |
| 英文 / 中文逗号解析 | ✅   |
| 空格 / 分号解析     | ✅   |
| 多行粘贴解析        | ✅   |
| 后台 help key 说明  | ✅   |
| 旧配置兼容          | ✅   |

### 推荐配置方向

| 类型       | 适合场景                             |
| :--------- | :----------------------------------- |
| Resource   | CPU / 内存 / 磁盘资源监控            |
| Network    | 实时速率、累计流量、连接与 Ping 分析 |
| GPU        | GPU 利用率、设备、显存与温度         |
| Operations | 资源、连接、进程、温度与网络质量     |
| Full       | 覆盖完整官方 Metric 能力             |
| Custom     | 自己决定卡片和图表顺序               |

---

## 📈 Metric 接口升级

新版接口优先，旧版 Komari 后端继续保持兼容。

```text
新版 Metric API 有效
        ↓
public:queryMetrics / public:getPingMetricStats
        ↓
无数据或接口不可用
        ↓
common:getRecords / legacy records fallback
        ↓
保持图表与 Ping 正常展示
```

| 项目                        | 状态                |
| :-------------------------- | :------------------ |
| `public:queryMetrics`       | ✅ 优先使用         |
| `public:getPingMetricStats` | ✅ 优先使用         |
| `common:getRecords`         | ✅ 自动 fallback    |
| 自定义 `start` / `end`      | ✅                  |
| Metric `null` 断点          | ✅ 保留，不误判丢包 |
| 旧接口负值丢包哨兵          | ✅ 兼容             |

---

## 📶 Ping 模块增强

| 优化项目                 | 状态 |
| :----------------------- | :--- |
| Min / Max / Avg / Latest | ✅   |
| P50 / P99 / 波动率       | ✅   |
| 多任务丢包统计           | ✅   |
| 100% 丢包任务保留        | ✅   |
| Null 点不再误判丢包      | ✅   |
| 自定义起止时间           | ✅   |
| 新旧接口自动切换         | ✅   |
| 快速切换请求防旧数据覆盖 | ✅   |

适用于网络抖动分析、短时丢包排查和特定时间段异常定位。

---

## 🪟 首页驾驶舱

- 地球、点阵地球、平铺地图三种视觉模式
- 卡片 / 列表双视图，列表在密集节点下自动虚拟化
- `mini` / `compact` / `comfortable` / `large` 四档卡片密度，默认保持 `compact`
- 官方、基础、运维、资源、财务、流量、GPU、资产、完整和自定义总览方案
- 月成本、总流量、上下行、峰值、离线、高负载、即将到期等快捷控制
- 节点 `message` 在卡片 / 列表以纯文本提示，不使用 `v-html`
- 自定义图片 / 视频背景、毛玻璃配色预设、色觉辅助配色和动画减弱选项

---

## 🧰 首页高级工具

高级工具仅在登录验证通过后显示和执行。

| 工具          | 用途                                               |
| :------------ | :------------------------------------------------- |
| 🗺️ 拓扑分析   | 根据 ASN、厂商、分组和标签分析节点关系与异常集中点 |
| 💰 性价比排行 | 比较每核、每 GB 内存、流量额度和周期成本           |
| 🩺 健康摘要   | 聚合负载、磁盘、流量、离线状态和 Ping 风险         |
| 📤 快照导出   | 导出 JSON / CSV，内置 CSV 公式注入防护             |
| 📜 审计日志   | 管理员 / 访客记录、结构化安全信息、JSON / CSV 导出 |

---

## 🧱 底层架构

新功能遵循统一调用链：

```text
Component
    ↓
Composable
    ↓
Service
    ↓
RequestManager / CacheService
    ↓
API / RPC
```

同步具备：

- [x] 请求去重与并发限制
- [x] 超时、重试和 Abort 清理
- [x] TTL / LRU-like / 引用计数缓存
- [x] Metric Store 优先与旧接口 fallback
- [x] 共享 Ping / 负载历史数据流
- [x] 登录权限与敏感操作校验
- [x] Vue 响应式节点索引和实时更新

---

## 🔒 公开访问与安全边界

首页和节点详情页始终保持公开，不使用全局路由守卫阻断普通监控。

| 公开能力               | 登录后能力                   |
| :--------------------- | :--------------------------- |
| 普通节点状态与实时指标 | Hidden 节点                  |
| Load / Ping 历史图表   | 拓扑、性价比、健康摘要       |
| Ping 延迟与丢包统计    | 快照导出与审计日志           |
| 公开厂商元数据         | Geo 增强、磁盘预测等敏感路径 |

安全细节包括：

- 快照导出需要登录验证，可选二级密码
- CSV 中和 `=`、`+`、`-`、`@`、`|` 等公式注入前缀
- Markdown 链接和图片限制 URL scheme，拦截 `javascript:`
- 未登录可隐藏价格、费用卡片和后台入口
- 登录过期时降级到公共展示，不让整个 dashboard 崩溃

---

## 📱 WebKit / iOS 兼容

| 环境                       | 策略                                         |
| :------------------------- | :------------------------------------------- |
| Safari 15.4+               | 构建语法目标与基础可用边界                   |
| Safari 16.4+               | Tailwind CSS v4 完整视觉基线                 |
| 缺少 `oklch` / `color-mix` | 使用 sRGB token 和可读降级样式               |
| 旧 WebKit                  | 关闭高成本毛玻璃，避免透明或不可读界面       |
| Firefox                    | 对密集卡片和控制层关闭多层 `backdrop-filter` |

> 兼容策略的目标是保证基础功能和文字可读，不承诺老旧内核拥有与现代浏览器完全一致的视觉效果。

---

## ⚙️ 主题设置

全部设置由 [`komari-theme.json`](komari-theme.json) 托管到 Komari 后台，无需修改代码。

| 分类           | 代表设置                                                          |
| :------------- | :---------------------------------------------------------------- |
| 基础与外观     | 主题模式、更新间隔、RPC 模式、默认视图、卡片尺寸                  |
| 首页布局       | 公告、地球样式、地球 IP 查询地址、访客信息、毛玻璃 / 色觉辅助配色 |
| 总览卡片       | 10 套方案、自定义 keys 和显示顺序                                 |
| 高级工具与隐私 | 工具总开关、隐藏后台 / 价格、厂商别名、导出二级密码               |
| 快捷控制与列表 | 快捷按钮、列表元数据、前台显示节点标签、离线置底、预警阈值        |
| 详情概览       | 18 类指标卡、7 套方案、分区标签页                                 |
| 详情图表       | 12 个图表族、9 套方案、GPU 图表和自定义 keys                      |
| 自定义背景     | 亮 / 暗 URL、图片 / 视频、模糊和遮罩                              |

---

## 📦 安装 / 升级

### 方式一：使用 GitHub 仓库地址

Komari 后台支持直接填写仓库地址并拉取最新 Release：

```text
https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism
```

### 方式二：手动安装 Release

1. 打开 [Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)
2. 下载最新的 `komari-theme-Glassmorphism-build-*.zip`
3. 登录 Komari Monitor 后台，进入 **设置 → 主题管理**
4. 上传 zip 并启用主题
5. 在主题设置中调整视觉、卡片、快捷控制和高级工具

> 请上传 Release 附件中的主题 zip，不要上传 GitHub 自动生成的源码压缩包。

---

## 🛠️ 本地开发

环境要求：Node.js `^20.19.0` 或 `>=22.12.0`，Bun `>=1.2.0`。

```bash
bun install
bun run dev
bun run lint
bun run build
bun run test:visual
bun run preview
```

更新确认过的视觉基准图：

```bash
bun run test:visual:update
```

视觉测试需要先执行 `bunx playwright install chromium`。截图差异会输出到 `test-results/` 和 `playwright-report/`；GitHub Actions 失败时会自动上传差异附件。

构建成功后会生成：

- `dist/`
- `komari-theme-Glassmorphism-build-<short-sha>.zip`

发布包固定包含：

```text
komari-theme.json
preview.png
dist/
```

> 发布版本只改 [`komari-theme.json`](komari-theme.json) 顶层 `version`，不要给 `package.json` 添加顶层 `version`。

---

## ⭐ Support

如果这个项目帮助到了你，欢迎：

- ⭐ Star 本项目
- 🍴 Fork 并贡献代码
- 💬 提交 Issue 或 Feature Request
- 📢 分享给更多 Komari 用户

你的每一个 Star，都是继续维护更新的动力。

---

## ☕ Donation / Sponsor

如果你喜欢这个项目，也欢迎支持后续开发。每一份支持都会用于功能开发、Bug 修复、性能优化、文档和长期维护。

感谢 **可乐杯里泡枸杞**、**Leo Lin**、**HelloWorldx** 、**johnmill**的捐赠支持。

---

## 🙏 致谢

感谢原始主题作者 **Tokinx**，感谢 [Komari](https://github.com/komari-monitor/komari)、[Komari Naive](https://github.com/tonyliuzj/komari-naive)、Vue、Vite、reka-ui、Tailwind CSS，以及所有反馈 Issue、提交 PR 和分享建议的朋友。

感谢以下衍生项目作者分享优化代码。本轮按主线架构移植或改写了以下部分，具体来源 SHA 和实现差异见 [融合记录](docs/fork-integration-2026-10-12.md)。

| 作者 / 项目                                                                                                                                                  | 本轮吸收的代码或设计                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [towersip](https://github.com/towersip) · [komari-theme-Glassmorphism](https://github.com/towersip/komari-theme-Glassmorphism)                               | A4 三网 SVG 小曲线、共享网格列 / 行高 / 状态配色 / 名称缩写、历史时段浮窗、独立样式开关及全局 / 按服务器任务选择与保存；参考 iOS 安全区处理。主线默认关闭，保留真实极值与断线、区分手机轻点和滑动，并适配保存权限与配置合并。 |
| [thinkemm](https://github.com/thinkemm) · [komari-theme-Glassmorphism](https://github.com/thinkemm/komari-theme-Glassmorphism)                               | 公共 Ping 任务列表 TTL 缓存、历史请求的任务信息取消清理，以及将 Ping 最新状态保留在响应式节点对象中。                                                                                                                         |
| [VoyagerProbe](https://github.com/VoyagerProbe) · [Glassmorphism-Plus](https://github.com/VoyagerProbe/Glassmorphism-Plus)                                   | Ping 浮窗 HTML 转义、同名任务唯一图例、保留缺测的 EWMA 展示平滑、窄屏轴标签避让；参考共享调度 / 后台暂停恢复与手机头部、弹窗布局，按主线服务边界重写。                                                                        |
| [pwremilk](https://github.com/pwremilk) · [komari-theme-Glassmorphism-custom](https://github.com/pwremilk/komari-theme-Glassmorphism-custom)                 | WebGL 不可用时回退平铺地图；主线扩展为按渲染器检测、初始化失败和上下文丢失回退，并同步地图布局。                                                                                                                              |
| [3560912451zz-stack](https://github.com/3560912451zz-stack) · [komari-theme-Glassmorphism](https://github.com/3560912451zz-stack/komari-theme-Glassmorphism) | 地理查询过滤非公网 IP、无效零坐标和过期结果；主线重写完整 IPv4 / IPv6 字面量解析、映射地址过滤和查询代次保护。                                                                                                                |
| [casiuna](https://github.com/casiuna) · [Glassmorphism-Enhanced](https://github.com/casiuna/Glassmorphism-Enhanced)                                          | 城市查询从 IPv4 回退 IPv6；保留主线登录权限、缓存、并发去重及国家级定位兜底。                                                                                                                                                 |
| [zfloong](https://github.com/zfloong) · [komari-theme-Glassmorphism](https://github.com/zfloong/komari-theme-Glassmorphism)                                  | Ping 的 7 / 15 / 30 天快捷范围；主线保留原 6 / 12 小时并按后端保留时间过滤。                                                                                                                                                  |

本轮还参考 thinkemm 的分组计数和 VoyagerProbe 的手机手势过滤，将计数做成默认关闭的配置，并适配现有 reka-ui 提示组件。

相关来源均为 MIT，保留本仓库 [LICENSE](LICENSE) 中的原始版权与许可声明。

## 📄 License

[MIT](LICENSE)
