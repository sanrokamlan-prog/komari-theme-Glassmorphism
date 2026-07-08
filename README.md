# Komari Glassmorphism

一款面向 **Komari Monitor** 的现代毛玻璃主题。以通透卡片、柔和背景、3D 地球/地图可视化和可配置总览为核心，提升服务器监控面板的观感与可读性。

![Version](https://img.shields.io/badge/version-2.2.0-10b981?style=flat-square)
![Vue](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Bun](https://img.shields.io/badge/Bun-%3E%3D1.2-000000?style=flat-square&logo=bun)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

[效果预览](#效果预览) · [主题特性](#主题特性) · [安装使用](#安装使用) · [主题配置](#主题配置) · [本地开发](#本地开发)

![Komari Glassmorphism 主题预览](docs/preview.png)

## 一屏看懂

| 项目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 主题定位 | Komari Monitor 监控面板主题，不是独立部署的通用 Web 应用               |
| 当前版本 | `v2.2.0`                                                               |
| 视觉风格 | 毛玻璃卡片、柔和渐变背景、浅色/深色模式适配                            |
| 核心页面 | 首页总览、节点卡片/列表、节点详情、延迟与负载图表                      |
| 地图能力 | 真实 3D 地球、cobe 点阵地球、平铺世界地图三种模式                      |
| 配置方式 | Komari 后台托管主题配置，可调总览卡片、快捷控制、背景、隐私等          |
| 发布产物 | Release 中的 `komari-theme-Glassmorphism-build-*.zip`，直接导入 Komari |

## 效果预览

| 首页总览                           | 可配置总览卡片                                         |
| ---------------------------------- | ------------------------------------------------------ |
| ![首页总览](docs/preview-home.png) | ![可配置总览卡片](docs/preview-configurable-cards.png) |



## 主题特性

### 视觉与交互

- **毛玻璃界面**：卡片、头部模块和信息容器使用半透明玻璃质感，层次清晰。
- **响应式布局**：适配桌面、平板和手机，移动端控制栏支持横向滚动。
- **浅色 / 深色 / 北京时间自动模式**：可在 Komari 后台设置默认模式，访客也可在本地切换。
- **可减弱动画**：提供减少页面过渡动画的配置，兼顾视觉效果与低性能设备体验。

### 首页总览

- **总览卡片预设**：基础、运维、财务、流量、完整、自定义多种方案。
- **指标覆盖全面**：在线节点、剩余价值、月/年费用、累计流量、实时速率、峰值、离线、高负载、即将到期、流量预警、连接峰值、地区/系统/虚拟化分布等。
- **快捷控制**：默认提供默认、月成本、总流量、实时峰值、离线、高负载、即将到期筛选/排序；上行、下行仍可通过自定义快捷按钮启用。
- **财务展示优化**：费用与剩余价值只保留带货币符号的金额，减少移动端空间占用。

### 地球与地图

- **真实 3D 地球**：以更直观的方式展示节点位置。
- **cobe 点阵地球**：轻量化点阵视觉，适合偏科技感的首页。
- **平铺世界地图**：更适合节点较多或需要快速浏览地区分布的场景。
- **安全位置标签**：地图仍会利用 IP 定位坐标；城市/地区名称仅在有可靠中文显示名时展示，避免暴露不精确或未翻译的实时定位文本。
- **可关闭旋转与地球模块**：适合需要更静态或更紧凑首页的部署。

### 节点卡片与详情

- **卡片 / 列表双视图**：支持在首页选择更适合自己的节点展示方式；列表信息栏默认显示厂商、地区和 ASN，城市字段可按需开启。
- **节点详情增强**：展示 CPU、内存、硬盘、网络、系统、厂商、ASN、近一天峰值等信息。
- **CPU 趣味评分**：根据 CPU 型号关键字估算一个展示分数，仅作娱乐参考。
- **价格隐私保护**：可配置未登录访客隐藏价格、剩余价值和费用类信息。
- **流量状态更直观**：总流量进度条按使用率分级显示颜色，便于快速识别风险节点。

### 自定义能力

- **公告模块**：可在首页显示自定义公告，支持简单 Markdown 内容。
- **背景自定义**：支持图片或视频背景，并可配置亮色/暗色背景、模糊和遮罩强度。
- **厂商别名**：可为 VPS 厂商配置自定义别名，提高识别准确度。
- **主题托管设置**：大部分能力均可在 Komari 后台主题设置中调整，无需改代码。

## 安装使用

1. 打开 [Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases) 页面。
2. 下载最新版本的 `komari-theme-Glassmorphism-build-*.zip`。
3. 登录 Komari Monitor 后台，进入 **设置 → 主题管理**。
4. 点击 **上传主题**，选择下载的 zip 文件。
5. 刷新页面，即可应用主题。

> 注意：请上传 Release 附件中的 zip 包，不要直接上传源码压缩包。

## 主题配置

主题配置由 `komari-theme.json` 声明，并在 Komari 后台以托管设置形式展示。

| 配置区域       | 主要能力                                                            |
| -------------- | ------------------------------------------------------------------- |
| 基础设置       | 默认主题模式、数据更新间隔、RPC 连接模式、默认视图、节点卡片尺寸    |
| 首页模块       | 公告、地球样式、隐藏地球/头部、访客信息、总览卡片方案、后台入口隐藏 |
| 节点与快捷控制 | 快捷按钮方案、默认快捷模式、高负载阈值、流量预警阈值、即将到期天数  |
| 财务与隐私     | 未登录隐藏价格、月成本排序、剩余价值、费用估算、多货币显示          |
| 背景设置       | 自定义图片/视频背景、亮暗色背景地址、背景模糊、背景遮罩             |

## 本地开发

### 环境要求

| 工具    | 版本                      |
| ------- | ------------------------- |
| Node.js | `^20.19.0` 或 `>=22.12.0` |
| Bun     | `>=1.2.0`                 |

### 常用命令

```bash
# 安装依赖
bun install

# 启动 Vite 开发服务器
bun run dev

# 自动修复并检查代码风格
bun run lint

# 类型检查 + 生产构建 + 主题 zip 打包
bun run build

# 预览生产构建
bun run preview
```

构建成功后会生成：

- `dist/`
- `komari-theme-Glassmorphism-build-<short-sha>.zip`

zip 包内包含 Komari 主题需要的 `komari-theme.json`、`preview.png` 和 `dist/`。

## 技术栈

| 类别        | 技术                              |
| ----------- | --------------------------------- |
| 框架        | Vue 3                             |
| 构建        | Vite 7                            |
| 包管理器    | Bun                               |
| UI 基础     | reka-ui + shadcn-vue 风格本地组件 |
| 样式        | Tailwind CSS v4 + tw-animate-css  |
| 状态管理    | Pinia                             |
| 路由        | Vue Router                        |
| 图标        | Iconify                           |
| 图表        | ECharts + vue-echarts             |
| 地球 / 地图 | globe.gl、three、cobe             |
| 工具        | VueUse、dayjs                     |
| 代码规范    | ESLint + @antfu/eslint-config     |

## 项目结构

```text
.
├─ docs/                 # README 与 Release 使用的预览图
├─ public/images/        # 运行时图片资源：旗帜、系统 logo 等
├─ src/
│  ├─ components/        # 业务组件与本地 UI 组件
│  ├─ composables/       # 可复用组合式逻辑
│  ├─ stores/            # Pinia 状态
│  ├─ styles/            # 全局 Tailwind v4 样式与设计 token
│  ├─ utils/             # API、RPC、格式化、地理与财务工具
│  └─ views/             # 首页与节点详情页
├─ komari-theme.json     # Komari 主题清单与托管配置
├─ vite.config.ts        # Vite 构建与主题 zip 打包配置
└─ package.json          # 项目命令与依赖版本
```

## 更新日志

### v2.2.0

- 优化列表视图字体与颜色层级，新增可配置的信息栏，默认展示厂商、地区和 ASN；城市字段改为可选开启。
- 新增详情页分区标签页开关，默认保持传统纵向布局，可在托管主题设置中切换为分区展示。
- 精简首页默认快捷控制，默认不再显示上行/下行；自定义配置仍可启用。
- 改进连接稳定性、到期/剩余价值计算、安全位置标签、隐藏节点一致性和基础交互可访问性。

### v2.1.1

- 优化首页总览卡片和节点详情中的费用 / 剩余价值展示，只保留带货币符号的金额。
- 同步主题清单与包版本到 `v2.1.1`。

### v2.1.0

- 新增后台托管默认主题模式，支持北京时间自动日夜切换。
- 默认背景调整为 Emerald 风格绿色顶光、网格和玻璃感表面。
- 财务计算新增 CAD，并补齐 RUB、CHF、INR、VND、THB 等货币支持。

更多历史版本请查看 [Releases](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases)。

## 致谢

- 原始主题作者：Tokinx
- 捐赠支持：可乐杯里泡枸杞、Leo Lin（排名不分先后）
- [Komari](https://github.com/komari-monitor/komari)
- [Komari Naive](https://github.com/tonyliuzj/komari-naive)
- [Vue](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [reka-ui](https://reka-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

本项目在原有 Komari Emerald 主题基础上进行了毛玻璃风格改造，感谢原作者和社区项目的贡献。

## License

[MIT](LICENSE)
