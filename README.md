<h3 align="center">komari-theme-Glassmorphism</h3>
<p align="center">
基于 Vue 3 + Vite + reka-ui + Tailwind CSS v4 的 Komari Monitor 毛玻璃主题
</p>

![preview](/docs/preview.png)

## 简介

### 鸣谢:可乐杯里泡枸杞 对我进行捐赠
komari-theme-Glassmorphism 是一个为 Komari Monitor 打造的毛玻璃（Glassmorphism）风格主题，以简洁现代的设计理念，打造清爽的监控面板视觉体验。此项目在原始 `Komari Emerald` 主题基础上进行了完整改造，优化了整体设计、色彩方案、卡片样式和交互体验。

## 效果预览

### 首页默认总览

![首页默认总览](/docs/preview-home.png)

### 头部卡片开关与排序

![头部卡片开关与排序](/docs/preview-configurable-cards.png)

### 节点详情

![节点详情](/docs/preview-detail.png)

### 更多场景

未登录主页

<img width="1322" height="596" alt="image" src="https://github.com/user-attachments/assets/7817e96b-4878-49a3-b310-7925e4662dad" />

未登录节点详情

<img width="2552" height="1272" alt="image" src="https://github.com/user-attachments/assets/5cc9ca3a-9108-45e0-be54-19f0177b267d" />

登录后主页节点卡片

<img width="309" height="310" alt="image" src="https://github.com/user-attachments/assets/f7081c2f-d9bb-4a5a-bc15-b6aa6b6af43c" />

登录后节点详情

<img width="2560" height="1266" alt="image" src="https://github.com/user-attachments/assets/5573241d-c3f1-4d61-b33d-824c8b7be594" />

## 主要改动

### 视觉设计

- 添加了根据识别到的cpu信息对vps进行打分的内容(仅供娱乐)
- 全局采用毛玻璃（Glassmorphism）设计风格，卡片和容器具有半透明玻璃效果
- 默认背景重新设计为柔和冷色渐变光斑 + 细网格纹理，和旧版绿色顶光背景明显区分
- 地球仪改用纯白色背景，搭配淡蓝色柔和光晕，提升整体洁净感,连线从访客ip出发到所有节点
- 地球连线采用更细更浅的设计，减少视觉压力，强调数据流向的轻盈感

### 交互和体验

- 头部总览卡片支持独立开关、排序和扩展指标展示
- 调整节点卡片尺寸和间距，增强可读性和视觉层次感
- 优化色彩方案，深色和浅色模式都采用现代配色

### 技术栈升级

- 迁移至 reka-ui + Tailwind CSS v4，移除 Naive UI 和 UnoCSS
- 采用 shadcn-vue 组件库设计模式，确保高度可定制性
- 优化性能和包体积

## 更新内容（v1.0.4）

- **节点卡片尺寸方案**：新增 `compact / comfortable / large` 三套节点卡片尺寸，compact 保持一排更多卡片，comfortable 与 large 提供更宽松的大卡片展示。
- **节点卡片排版优化**：三列小信息盒保持等宽，优化「剩余 xxx 天」与价格行排版，避免天数单位丢失，同时满足统一盒子尺寸的视觉一致性。
- **访客信息开关**：新增访客信息显示开关与访客位置连线开关，可分别关闭底部访客信息卡片和地球访客坐标请求。
- **厂商识别增强**：新增厂商自定义别名配置，支持商家 / 网络双显示，并在详情页提供识别来源 tooltip；厂商文本与 tooltip 支持自然换行，避免长内容溢出或不合适切断。

## 更新内容（v1.0.3）

- **头部总览卡片可配置**：新增「头部卡片设置」，现有 6 张总览卡片可独立开关，并支持通过英文逗号配置显示顺序；额外提供在线节点、平均 CPU、平均负载、交换内存、进程总数、连接数、平均温度、CPU 核心、流量配额等可选卡片
- **默认背景重绘**：内置默认背景改为浅蓝、薄荷绿、淡紫渐变光斑与细网格纹理，保持毛玻璃通透感的同时与旧版配色明显区分

## 更新内容（v1.0.0）

- **节点卡片信息重构**：卡片左上角显示「在线天数 + 价格」，流量旁第三列显示「剩余天数 + 剩余价值」（剩余价值按剩余天数占计费周期的比例折算），并加图标与相邻列对齐
- **未登录隐藏价格**：新增主题设置项，开启后未登录访客在卡片 / 列表中只看到在线天数、剩余天数，价格与剩余价值被隐藏；总览与详情页对应金额显示为 `***`
- **节点详情页增强**：
  - 硬件信息显示节点 **IP（仅登录可见，未登录回退架构）**，GPU 按需显示（无 GPU 不占位）
  - 系统信息显示 **城市 · 厂商 · ASN**，厂商按 IP 的真实 ASN 精准识别（含 ASN 号兜底，如 AS36352→ColoCrossing）+ 节点名/标签辅助识别 + 扩充厂商库
  - 总流量进度条 **按使用率分级配色**（≥80% 红 / 60-80% 琥珀 / <60% 绿），内嵌 IPv4/IPv6 支持角标，并显示**近一天网速峰值**
  - 顶部显示节点自定义标签，两侧信息卡等高对齐
- **地球城市级定位**：节点按各 VPS 的 IP 在线解析定位到具体城市；多服务**轮询调度**（ip.sb / ipinfo.io / ipwho.is / ipapi.co 轮流起始 + 按 IP 缓存）分摊请求、避免频控；解析不到 IP 时自动回退国家级
- **运行时性能优化**：节点状态轮询改为「就地按字段更新、仅在值变化时赋值」，避免每轮整体替换对象导致的全量重渲染，节点越多收益越明显

## 使用

1. 从当前仓库的 [Release 页面](https://github.com/sanrokamlan-prog/komari-theme-Glassmorphism/releases) 下载最新的 `komari-theme-Glassmorphism-build-*.zip` 文件
2. 登录 Komari Monitor 后，点击"设置"，进入"主题管理"选项卡
3. 点击"上传主题"，选择下载的 zip 文件
4. 刷新页面，即可应用主题

## 环境要求

- Node.js: `^20.19.0` 或 `>=22.12.0`
- Bun: `>=1.2.0`

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 代码检查
bun run lint
```

## 构建

```bash
# 类型检查 + 生产构建
bun run build

# 预览生产构建
bun run preview
```

## 技术栈

| 类别     | 技术                             |
| -------- | -------------------------------- |
| 框架     | Vue 3                            |
| 构建工具 | Vite 7                           |
| UI 组件  | reka-ui（shadcn-vue 风格组件）   |
| 样式方案 | Tailwind CSS v4 + tw-animate-css |
| 状态管理 | Pinia 3                          |
| 路由     | Vue Router 5                     |
| 提示系统 | vue-sonner（Toaster）            |
| 图标     | @iconify/vue                     |
| 图表     | vue-echarts                      |
| 3D 地球  | cobe                             |
| 实用工具 | @vueuse/core, dayjs              |
| 代码规范 | ESLint (@antfu/eslint-config)    |

## 主要特性

### 3D 地球交互

- 基于 cobe 库的交互式 3D 地球仪，展示全球节点分布
- 按节点 IP 在线解析定位到具体城市，解析失败回退国家级
- 实时服务器位置标记和带宽流向可视化
- 支持鼠标拖拽旋转、缩放，自动旋转功能

### 响应式设计

- 完全响应式布局，适配桌面、平板和移动设备
- 深色/浅色模式自动切换，支持用户偏好设置
- 流畅的过渡动画和交互反馈

### 数据展示

- 实时节点监控信息，包括在线状态、CPU、内存、带宽等
- 网络延迟和性能图表展示
- 访问者地理位置信息展示

## 致谢

- 原始主题作者：Tokinx
- [Komari](https://github.com/komari-monitor/komari)
- [Komari Naive](https://github.com/tonyliuzj/komari-naive)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [reka-ui](https://reka-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

本项目在原有 `Komari Emerald` 主题基础上进行了毛玻璃风格改造，特此感谢原作者 Tokinx 的贡献。

## License

[MIT](./LICENSE)
