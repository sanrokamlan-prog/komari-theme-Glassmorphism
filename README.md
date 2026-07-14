<div align="center">

# 🌌 Komari Glassmorphism

## 给 Komari Monitor 的一套「玻璃拟态 · 运维驾驶舱」主题

好看只是外壳，v3 真正的重点是把 metric store、Ping 统计、审计日志、健康摘要、拓扑、费用、流量和磁盘预测，整合成一套日常真的会打开来看的监控面板。

![Version](https://img.shields.io/github/v/release/sanrokamlan-prog/komari-theme-Glassmorphism?style=for-the-badge&label=release&color=10b981)
![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Bun](https://img.shields.io/badge/Bun-%3E%3D1.2-000000?style=for-the-badge&logo=bun)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**[📥 下载 Release](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)** ·
**[🚀 安装](#-安装)** ·
**[✨ 功能](#-功能雷达)** ·
**[⚙️ 设置](#️-主题设置)** ·
**[🛠️ 开发](#️-本地开发)**

</div>

---

## 📸 预览

<div align="center">

<img src="docs/preview-home.png" width="49%" alt="首页预览" />
<img src="docs/preview-detail.png" width="49%" alt="详情页预览" />

</div>

---

## 🚀 一眼定位

| 项目     | 说明                                                                  |
| -------- | --------------------------------------------------------------------- |
| 当前版本 | **v3.1.2**                                                            |
| 主题定位 | Komari Monitor 可导入 zip 主题，不是普通 Web App 部署包               |
| 视觉风格 | 毛玻璃卡片、动态背景、浅色 / 深色 / 北京时间自动日夜模式              |
| 数据能力 | 新版 metric store 优先，旧接口自动 fallback，兼容 Komari 1.2.x 新字段 |
| 高级工具 | 拓扑、性价比、健康摘要、快照导出、审计日志                            |
| 发布产物 | `komari-theme-Glassmorphism-build-*.zip`                              |

---

## ✨ 功能雷达

### 🪟 玻璃拟态驾驶舱

- 首页支持 **地球 / 点阵地球 / 平铺地图** 三种视觉模式
- 卡片 / 列表双视图自由切换，`mini` / `compact` / `comfortable` / `large` 四档密度
- 总览卡片支持官方、基础、运维、资源、财务、流量、GPU、资产、完整和自定义方案
- 快捷筛选：默认、月成本、总流量、上下行、峰值、离线、高负载、即将到期
- 节点 `message` 会在卡片 / 列表以纯文本 tooltip 提示，避免 HTML 注入

### 📈 Metric Store 图表增强

- 对齐 Komari 1.2.6 的 25 个 Metric Store definition，归并为 12 个适合监控面板的图表族
- 覆盖 CPU / Load、RAM / Swap / Total、Disk / Total、实时网络、累计 / 周期流量、GPU / 设备、显存、温度、TCP / UDP、进程、Ping 延迟与丢包
- 提供默认、精简、资源、网络、GPU、延迟、运维、完整、自定义 9 套详情图表方案，英文 keys 支持逗号、空格和换行
- GPU 设备与 Ping 任务按标签拆分多序列；无 definition 或无数据的扩展图表自动隐藏
- LoadChart 和独立 Ping 图都支持 **自定义开始 / 结束时间范围**；新接口精确传 `start/end`，旧接口自动 fallback
- 新 metric 的 `null` 保持图表断点，不再误报丢包；legacy records 继续按 `value < 0` 识别丢包

### 🧩 节点详情自定义

- 详情概览支持财务、状态、资源、网络、GPU、综合、自定义 7 套方案和 18 类指标卡
- 概览卡按移动端 2 列、中屏 3 列、宽屏 4 列响应式排列，预设使用 8 / 12 / 16 张卡片
- 图表卡使用统一语义图标和颜色头部，保留旧图表 keys、旧卡位和 JSON 配置兼容
- 主题设置按 8 个区段重构，复杂 key 列表改为多行输入，help 写明每个英文 key 的含义

### 🧭 首页高级工具

登录后可在主题设置中整体开关：

| 工具        | 用途                                                      |
| ----------- | --------------------------------------------------------- |
| 🗺️ 拓扑     | 查看分组、离线上游和节点关系，快速判断异常集中点          |
| 💰 性价比   | 结合价格、周期、物理 / 逻辑核心、内存和流量做成本分析     |
| 🩺 健康摘要 | 按日 / 周 / 月 / 有史以来聚合负载、流量、磁盘和 Ping 风险 |
| 📤 快照导出 | 导出 JSON / CSV，CSV 内置公式注入防护                     |
| 📜 审计日志 | 只读查看管理员操作日志，支持分页                          |

### 🧠 运维预测与统计

- **磁盘耗尽预测**：基于历史磁盘增长趋势估算剩余天数，新节点或历史不足时显示「数据积累中」，不会让人误以为功能坏了
- Ping 支持 min / max / avg / latest、P50 / P99、波动率、丢包率
- 首页节点卡片保持干净，延迟、丢包和关键资源一屏展示
- 健康摘要主动提示离线、磁盘风险、流量预警和网络质量异常

### 💰 财务 / 流量 / 隐私

- 支持价格、周期、到期、剩余价值、月成本、年成本，多货币格式化和汇率换算
- 支持厂商别名、地区、城市、ASN、标签、分组元数据
- 未登录可隐藏价格、费用类卡片和后台入口
- Hidden 节点仅登录后显示，公开首页和详情仍保持公开访问

### 🔒 安全加固

- 高级工具、历史指标、Geo 查询全部纳入登录权限校验
- 快照导出防 CSV 公式注入，可选二级密码
- 公告 Markdown 渲染加了 URL scheme 白名单，`javascript:` 链接直接拦截

---

## ⚙️ 主题设置

所有设置都由 [`komari-theme.json`](komari-theme.json) 托管到 Komari 后台，**无需改代码**。

| 分类 | 代表设置                                                    |
| ---- | ----------------------------------------------------------- |
| 基础 | 主题模式、刷新间隔、RPC 连接模式、默认视图、卡片尺寸        |
| 首页 | 公告、地球样式、总览卡片、快捷按钮、高级工具、隐藏后台入口  |
| 外观 | 毛玻璃预设、自定义玻璃颜色、自定义图片 / 视频背景、动画减弱 |
| 节点 | 列表字段、离线置底、高负载阈值、流量预警阈值、厂商别名      |
| 详情 | 18 类概览卡、12 个图表族、GPU 图表、分区标签页、磁盘预测    |
| 高级 | 导出二级密码、自定义配色、英文 keys 多行模板                |

---

## 📦 安装

**方式一：GitHub 地址自动导入**

Komari 后台的主题导入现在支持直接粘贴仓库地址，自动拉取最新 Release 安装：

```
https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism
```

**方式二：手动下载**

1. 打开 [Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)
2. 下载最新的 `komari-theme-Glassmorphism-build-*.zip`
3. 登录 Komari Monitor 后台，进入 **设置 → 主题管理**
4. 上传 zip，启用主题
5. 在主题设置里按需调整视觉、卡片、快捷按钮和高级工具

> ⚠️ 请上传 Release 附件里的主题 zip，不要上传源码压缩包。

---

## 🛠️ 本地开发

环境：Node.js `^20.19.0` 或 `>=22.12.0`，Bun `>=1.2.0`。

```bash
bun install
bun run dev
bun run lint
bun run build
bun run preview
```

构建成功后会生成：

- `dist/`
- `komari-theme-Glassmorphism-build-<short-sha>.zip`

> 发布版本只改 [`komari-theme.json`](komari-theme.json) 顶层 `version` 字段，不要给 [`package.json`](package.json) 添加顶层 `version`。

---

## 📝 更新日志

<details open>
<summary><strong>v3.1.2</strong></summary>

- 修复启动健康检查偶发失败时跳过用户信息、节点数据和实时连接，导致登录状态错误及详情页无数据的问题
- 健康检查增加 5 秒超时和 3 次递增间隔重试，超时请求会被主动取消
- 公开设置、用户信息、节点数据与健康检查改为独立并行初始化，单项失败不再拖垮整条启动链
- 节点首次加载失败时仍启动 WebSocket / HTTP 轮询自动恢复；连接错误提示提升到全局并支持手动重试

</details>

<details>
<summary><strong>v3.1.1</strong></summary>

- 修复升级后默认背景被页面实色层遮挡、暗色模式显示全黑的问题
- 修复列表模式 Ping 气泡遮挡运行时间，并减少列表小 Ping 条的 DOM 与 hover 合成开销
- 普通节点 Ping 延迟和丢包历史恢复公开访问，高级工具、Geo、导出、审计和磁盘预测权限保持不变
- 修复详情 Ping 快速切换节点或时间范围时旧请求覆盖新结果，并优化大样本时间合并性能
- 首页快捷控制计数不再为只取数量重复排序全部节点

</details>

<details>
<summary><strong>v3.1.0</strong></summary>

- 对齐 Komari / komari-web 1.2.6，将官方 25 个 metric definition 归并为 12 个可配置图表族
- 新增累计 / 周期流量、GPU 设备、显存、温度、Ping 延迟与丢包图表，统一图标头部并按数据自动隐藏
- 详情概览恢复宽屏四列，新增 7 套概览预设与 9 套图表预设，英文 keys 支持多行配置
- Ping 图增加自定义起止时间；修复 metric `null` 丢包误报、100% 丢包任务过滤和多任务等权汇总问题
- 重构主题设置分区和 help，补充旧 WebKit / iOS 15.4 可读 fallback，并优化亮色刷新过渡

</details>

<details>
<summary><strong>v3.0.3</strong></summary>

- 合并共享服务 chunk，统一详情历史请求缓存维度，降低重复请求与资源碎片

</details>

<details>
<summary><strong>v3.0.2</strong></summary>

- 首页节点卡片移除物理核心和"数据积累中"等诊断文案，保持公开首页干净
- 磁盘预测样本不足提示移动到详情页磁盘模块展示

</details>

<details>
<summary><strong>v3.0.1</strong></summary>

- 新增审计日志高级工具，支持分页
- LoadChart 增加自定义时间范围；metric definitions 增加 TTL 缓存
- 性价比分析补齐物理核心，每核成本优先按物理核计算
- 修复 `SharedCache.retain()` 覆盖同 key 后的引用计数释放问题

</details>

<details>
<summary><strong>v3.0.0</strong></summary>

- 接入官方新版 metric store：Ping、负载历史、GPU 指标优先走 public metric API，旧后端自动 fallback
- 新增节点 `message` 提示、GPU 图表、`chartDashboardTemplate`、Ping 统计增强
- 强化拓扑、健康摘要、快照导出、CSV 安全、厂商元数据、请求缓存和 Komari 1.2.x 兼容

</details>

更多历史版本请查看 [Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)。

---

## 📄 License

[MIT](LICENSE)

---

## ⭐ Support

如果这个项目帮助到了你，欢迎：

- ⭐ Star 本项目
- 🍴 Fork 并贡献代码
- 💬 提交 Issue 或 Feature Request
- 📢 分享给更多 Komari 用户

你的每一个 Star，都是继续更新下去最大的动力。

## ☕ Support the Project

如果你喜欢这个项目，并希望支持后续开发，也欢迎请我喝杯咖啡 ☕。

你的每一份支持，都将用于：

- 🚀 持续开发新功能
- 🐛 修复 Bug 与性能优化
- 📖 完善文档与教程
- 💻 项目长期维护与服务器开销

### 💖 Donation / Sponsor

> 如果觉得这个项目值得支持，欢迎以任何方式赞助作者。

每一份支持，无论金额大小，都是项目持续更新的动力 ❤️

## ❤️ 写在最后

从最初的一个简单主题，到现在的 **Glassmorphism v3.1**。

感谢每一位提出 Issue、提交 PR、反馈 Bug、提出建议的朋友。

因为有你们，这个项目才能不断成长。

未来，我仍会持续维护和更新它，带来更多高质量的新功能与优化。

---

## 🙏 致谢

感谢原始主题作者 **Tokinx**，感谢 **可乐杯里泡枸杞**、**Leo Lin**、**HelloWorldx**的捐赠支持，感谢 [Komari](https://github.com/komari-monitor/komari)、[Komari Naive](https://github.com/tonyliuzj/komari-naive)、Vue、Vite、reka-ui、Tailwind CSS 以及所有反馈 Issue / PR / 建议的朋友。
