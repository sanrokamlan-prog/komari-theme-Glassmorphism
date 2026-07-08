import type { PublicSettings } from '@/utils/api'
import type { ByteDecimalsConfig } from '@/utils/helper'
import { useStorageAsync } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ManagedThemeMode = 'beijing' | 'light' | 'dark'
export type GeneralCardKey
  = | 'memory'
    | 'disk'
    | 'remainingValue'
    | 'totalTraffic'
    | 'uploadSpeed'
    | 'downloadSpeed'
    | 'onlineNodes'
    | 'avgCpu'
    | 'avgLoad'
    | 'swap'
    | 'processes'
    | 'connections'
    | 'cpuCores'
    | 'trafficQuota'
    | 'trafficPeak'
    | 'uploadPeakNode'
    | 'downloadPeakNode'
    | 'offlineNodes'
    | 'highLoadNodes'
    | 'expiringNodes'
    | 'trafficWarnings'
    | 'connectionPeakNode'
    | 'regionDistribution'
    | 'systemDistribution'
    | 'virtualizationDistribution'
    | 'monthlyCost'
    | 'yearlyCost'

export type HomeQuickControlKey
  = | 'default'
    | 'monthlyCost'
    | 'totalTraffic'
    | 'upload'
    | 'download'
    | 'peak'
    | 'offline'
    | 'highLoad'
    | 'expiring'

export type NodeListMetadataField
  = | 'provider'
    | 'region'
    | 'city'
    | 'asn'
    | 'tags'
    | 'group'

type GeneralCardPreset = 'basic' | 'ops' | 'finance' | 'traffic' | 'full' | 'custom'
type HomeQuickControlPreset = 'basic' | 'traffic' | 'ops' | 'full' | 'custom'
type Lang = 'zh-CN' | 'en-US'
type NodeViewMode = 'card' | 'list'
type NodeCardSize = 'mini' | 'compact' | 'comfortable' | 'large'
type RpcTransportMode = 'websocket' | 'http'
type EarthRenderer = 'realistic' | 'cobe' | 'tiled'

type ThemeSettings = Record<string, unknown>

/** 固定的字节精度配置 */
const BYTE_DECIMALS: ByteDecimalsConfig = {
  B: 0,
  KB: 0,
  MB: 1,
  GB: 1,
  TB: 2,
}

const DEFAULT_GENERAL_CARD_ORDER: GeneralCardKey[] = [
  'memory',
  'disk',
  'remainingValue',
  'totalTraffic',
  'uploadSpeed',
  'downloadSpeed',
]

const ALL_GENERAL_CARD_KEYS = [
  'memory',
  'disk',
  'remainingValue',
  'monthlyCost',
  'totalTraffic',
  'uploadSpeed',
  'downloadSpeed',
  'onlineNodes',
  'offlineNodes',
  'avgCpu',
  'avgLoad',
  'swap',
  'processes',
  'connections',
  'cpuCores',
  'trafficQuota',
  'trafficPeak',
  'uploadPeakNode',
  'downloadPeakNode',
  'highLoadNodes',
  'expiringNodes',
  'trafficWarnings',
  'connectionPeakNode',
  'regionDistribution',
  'systemDistribution',
  'virtualizationDistribution',
  'yearlyCost',
] as const satisfies readonly GeneralCardKey[]

const DEFAULT_GENERAL_CARD_ENABLED: Record<GeneralCardKey, boolean> = {
  memory: true,
  disk: true,
  remainingValue: true,
  totalTraffic: true,
  uploadSpeed: true,
  downloadSpeed: true,
  onlineNodes: false,
  avgCpu: false,
  avgLoad: false,
  swap: false,
  processes: false,
  connections: false,
  cpuCores: false,
  trafficQuota: false,
  trafficPeak: false,
  uploadPeakNode: false,
  downloadPeakNode: false,
  offlineNodes: false,
  highLoadNodes: false,
  expiringNodes: false,
  trafficWarnings: false,
  connectionPeakNode: false,
  regionDistribution: false,
  systemDistribution: false,
  virtualizationDistribution: false,
  monthlyCost: false,
  yearlyCost: false,
}

const LEGACY_GENERAL_CARD_SETTING_KEYS: Partial<Record<GeneralCardKey, string>> = {
  memory: 'generalCardMemoryEnabled',
  disk: 'generalCardDiskEnabled',
  remainingValue: 'generalCardRemainingValueEnabled',
  totalTraffic: 'generalCardTotalTrafficEnabled',
  uploadSpeed: 'generalCardUploadSpeedEnabled',
  downloadSpeed: 'generalCardDownloadSpeedEnabled',
  onlineNodes: 'generalCardOnlineNodesEnabled',
  avgCpu: 'generalCardAvgCpuEnabled',
  avgLoad: 'generalCardAvgLoadEnabled',
  swap: 'generalCardSwapEnabled',
  processes: 'generalCardProcessesEnabled',
  connections: 'generalCardConnectionsEnabled',
  cpuCores: 'generalCardCpuCoresEnabled',
  trafficQuota: 'generalCardTrafficQuotaEnabled',
}

const DEFAULT_HOME_QUICK_CONTROL_ORDER: HomeQuickControlKey[] = [
  'default',
  'monthlyCost',
  'totalTraffic',
  'peak',
  'offline',
  'highLoad',
  'expiring',
]

const ALL_HOME_QUICK_CONTROL_KEYS = [
  ...DEFAULT_HOME_QUICK_CONTROL_ORDER,
  'upload',
  'download',
] as const satisfies readonly HomeQuickControlKey[]

const DEFAULT_NODE_LIST_METADATA_FIELDS: NodeListMetadataField[] = [
  'provider',
  'region',
  'asn',
]

const ALL_NODE_LIST_METADATA_FIELDS = [
  ...DEFAULT_NODE_LIST_METADATA_FIELDS,
  'tags',
  'group',
] as const satisfies readonly NodeListMetadataField[]

const GENERAL_CARD_PRESETS: Record<GeneralCardPreset, GeneralCardKey[]> = {
  basic: DEFAULT_GENERAL_CARD_ORDER,
  ops: [
    ...DEFAULT_GENERAL_CARD_ORDER,
    'onlineNodes',
    'offlineNodes',
    'highLoadNodes',
    'trafficWarnings',
    'connectionPeakNode',
    'avgCpu',
    'avgLoad',
    'cpuCores',
    'trafficQuota',
  ],
  finance: [
    ...DEFAULT_GENERAL_CARD_ORDER,
    'expiringNodes',
    'monthlyCost',
    'yearlyCost',
  ],
  traffic: [
    ...DEFAULT_GENERAL_CARD_ORDER,
    'trafficPeak',
    'uploadPeakNode',
    'downloadPeakNode',
    'trafficWarnings',
    'trafficQuota',
  ],
  full: [...ALL_GENERAL_CARD_KEYS],
  custom: DEFAULT_GENERAL_CARD_ORDER,
}

const HOME_QUICK_CONTROL_PRESETS: Record<HomeQuickControlPreset, HomeQuickControlKey[]> = {
  basic: ['default', 'monthlyCost', 'peak', 'offline'],
  traffic: ['default', 'totalTraffic', 'peak'],
  ops: ['default', 'monthlyCost', 'offline', 'highLoad', 'expiring'],
  full: DEFAULT_HOME_QUICK_CONTROL_ORDER,
  custom: DEFAULT_HOME_QUICK_CONTROL_ORDER,
}

const GENERAL_CARD_PRESET_ALIASES: Record<string, GeneralCardPreset> = {
  basic: 'basic',
  基础: 'basic',
  ops: 'ops',
  运维: 'ops',
  finance: 'finance',
  财务: 'finance',
  traffic: 'traffic',
  流量: 'traffic',
  full: 'full',
  完整: 'full',
  custom: 'custom',
  自定义: 'custom',
}

const HOME_QUICK_CONTROL_PRESET_ALIASES: Record<string, HomeQuickControlPreset> = {
  basic: 'basic',
  基础: 'basic',
  traffic: 'traffic',
  流量: 'traffic',
  ops: 'ops',
  运维: 'ops',
  full: 'full',
  完整: 'full',
  custom: 'custom',
  自定义: 'custom',
}

const EMPTY_THEME_SETTINGS: ThemeSettings = {}

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark'
}

function isValidManagedThemeMode(value: unknown): value is ManagedThemeMode {
  return value === 'beijing' || value === 'light' || value === 'dark'
}

function getBeijingHour(timestamp: number): number {
  const hour = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(new Date(timestamp))

  const parsed = Number.parseInt(hour, 10)
  if (!Number.isFinite(parsed))
    return new Date(timestamp).getHours()

  return parsed === 24 ? 0 : parsed
}

function isGeneralCardKey(value: string): value is GeneralCardKey {
  return (ALL_GENERAL_CARD_KEYS as readonly string[]).includes(value)
}

function isHomeQuickControlKey(value: string): value is HomeQuickControlKey {
  return (ALL_HOME_QUICK_CONTROL_KEYS as readonly string[]).includes(value)
}

function isNodeListMetadataField(value: string): value is NodeListMetadataField {
  return (ALL_NODE_LIST_METADATA_FIELDS as readonly string[]).includes(value)
}

function parseGeneralCardPreset(value: unknown): GeneralCardPreset {
  if (typeof value !== 'string')
    return 'basic'

  return GENERAL_CARD_PRESET_ALIASES[value.trim()] ?? 'basic'
}

function parseHomeQuickControlPreset(value: unknown): HomeQuickControlPreset {
  if (typeof value !== 'string')
    return 'full'

  return HOME_QUICK_CONTROL_PRESET_ALIASES[value.trim()] ?? 'full'
}

function normalizeHomeQuickControlOrder(keys: HomeQuickControlKey[]): HomeQuickControlKey[] {
  return ['default', ...keys.filter(key => key !== 'default')]
}

function normalizeThemeSettings(raw: unknown): ThemeSettings {
  if (!raw)
    return EMPTY_THEME_SETTINGS

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      return normalizeThemeSettings(parsed)
    }
    catch {
      return EMPTY_THEME_SETTINGS
    }
  }

  if (typeof raw === 'object' && !Array.isArray(raw))
    return raw as ThemeSettings

  return EMPTY_THEME_SETTINGS
}

function parseKeyList<T extends string>(rawValue: unknown, isValid: (value: string) => value is T, fallback: readonly T[]): T[] {
  const parsedKeys: T[] = []
  const seenKeys = new Set<T>()

  if (typeof rawValue === 'string') {
    for (const item of rawValue.split(',')) {
      const key = item.trim()
      if (!isValid(key) || seenKeys.has(key))
        continue
      parsedKeys.push(key)
      seenKeys.add(key)
    }
  }

  return parsedKeys.length > 0 ? parsedKeys : [...fallback]
}

function readBooleanSetting(settings: ThemeSettings, key: string, fallback: boolean): boolean {
  const value = settings[key]
  return typeof value === 'boolean' ? value : fallback
}

function readNumberSetting(settings: ThemeSettings, key: string, fallback: number, min: number, max: number): number {
  const value = settings[key]
  if (typeof value !== 'number' || !Number.isFinite(value))
    return fallback

  return Math.min(Math.max(value, min), max)
}

const useAppStore = defineStore('app', () => {
  const loading = ref<boolean>(true)

  // 使用 VueUse 的 useStorageAsync 实现自动持久化
  const themeMode = useStorageAsync<ThemeMode>('themeMode', 'auto', localStorage)
  const lang = ref<Lang>('zh-CN')
  const publicSettings = ref<PublicSettings>()
  const nodeSelectedGroup = useStorageAsync<string>('nodeSelectedGroup', 'all', localStorage)
  const isLoggedIn = ref<boolean>(false)
  const connectionError = ref<boolean>(false)

  const themeSettings = computed(() => normalizeThemeSettings(publicSettings.value?.theme_settings))

  // 首页滚动位置记忆
  const homeScrollPosition = ref<number>(0)

  // 使用 null 表示未设置，等待主题配置加载后决定
  const storedViewMode = useStorageAsync<NodeViewMode | null>('nodeViewMode', null, localStorage)

  const beijingTimeTick = ref(Date.now())
  if (typeof window !== 'undefined') {
    window.setInterval(() => {
      beijingTimeTick.value = Date.now()
    }, 60 * 1000)
  }

  // 计算属性：从主题配置获取默认视图模式
  const defaultViewMode = computed<NodeViewMode>(() => {
    const settings = themeSettings.value
    if (typeof settings.defaultViewMode === 'string') {
      const mode = settings.defaultViewMode
      if (mode === 'card' || mode === 'list') {
        return mode
      }
    }
    return 'card'
  })

  // 校验视图模式是否为合法值
  function isValidViewMode(value: string | null): value is NodeViewMode {
    return value === 'card' || value === 'list'
  }

  function isValidNodeCardSize(value: unknown): value is NodeCardSize {
    return value === 'mini' || value === 'compact' || value === 'comfortable' || value === 'large'
  }

  function isValidEarthRenderer(value: unknown): value is EarthRenderer {
    return value === 'realistic' || value === 'cobe' || value === 'tiled'
  }

  const nodeCardSize = computed<NodeCardSize>(() => {
    const settings = themeSettings.value
    if (isValidNodeCardSize(settings.nodeCardSize))
      return settings.nodeCardSize
    return 'compact'
  })

  // 当前实际使用的视图模式
  const nodeViewMode = computed<NodeViewMode>({
    get: () => {
      // 校验 storedViewMode 是否为合法值，非法值时使用默认值
      if (storedViewMode.value !== null && isValidViewMode(storedViewMode.value)) {
        return storedViewMode.value
      }
      return defaultViewMode.value
    },
    set: (val) => {
      storedViewMode.value = val
    },
  })

  // 计算属性：从主题配置获取 RPC 连接模式
  const rpcTransportMode = computed<RpcTransportMode>(() => {
    const settings = themeSettings.value
    if (typeof settings.rpcTransportMode === 'string') {
      const mode = settings.rpcTransportMode
      if (mode === 'websocket' || mode === 'http') {
        return mode
      }
    }
    return 'http'
  })

  // 字节格式化精度（固定配置）
  const byteDecimals: ByteDecimalsConfig = { ...BYTE_DECIMALS }

  // 计算属性：公告配置
  const alertEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'alertEnabled', false))

  const alertTitle = computed<string>(() => {
    const value = themeSettings.value.alertTitle
    return typeof value === 'string' ? value : ''
  })

  const alertContent = computed<string>(() => {
    const value = themeSettings.value.alertContent
    return typeof value === 'string' ? value : ''
  })

  const dataUpdateInterval = computed<number>(() => readNumberSetting(themeSettings.value, 'dataUpdateInterval', 3, 1, 60))

  const stopEarth = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'stopEarth', false))

  const earthRenderer = computed<EarthRenderer>(() => {
    const value = themeSettings.value.earthRenderer
    return isValidEarthRenderer(value) ? value : 'realistic'
  })

  const hideEarth = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'hideEarth', false))

  const hideGeneralCard = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'hideGeneralCard', false))

  const visitorInfoEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'visitorInfoEnabled', true))

  const generalCardEnabledMap = computed<Record<GeneralCardKey, boolean>>(() => {
    const settings = themeSettings.value
    const enabledMap = { ...DEFAULT_GENERAL_CARD_ENABLED }

    for (const key of ALL_GENERAL_CARD_KEYS) {
      const settingKey = LEGACY_GENERAL_CARD_SETTING_KEYS[key]
      if (!settingKey)
        continue

      const value = settings[settingKey]
      if (typeof value === 'boolean')
        enabledMap[key] = value
    }

    return enabledMap
  })

  const generalCardOrder = computed<GeneralCardKey[]>(() => {
    const settings = themeSettings.value
    const hasNewPreset = typeof settings.generalCardPreset === 'string'
    const preset = parseGeneralCardPreset(settings.generalCardPreset)

    if (hasNewPreset) {
      if (preset === 'custom')
        return parseKeyList(settings.generalCardKeys, isGeneralCardKey, DEFAULT_GENERAL_CARD_ORDER)

      return [...GENERAL_CARD_PRESETS[preset]]
    }

    if (typeof settings.generalCardKeys === 'string')
      return parseKeyList(settings.generalCardKeys, isGeneralCardKey, DEFAULT_GENERAL_CARD_ORDER)

    const orderedKeys = parseKeyList(settings.generalCardOrder, isGeneralCardKey, DEFAULT_GENERAL_CARD_ORDER)
    const orderedKeySet = new Set<GeneralCardKey>(orderedKeys)
    for (const key of ALL_GENERAL_CARD_KEYS) {
      if (orderedKeySet.has(key))
        continue
      orderedKeys.push(key)
      orderedKeySet.add(key)
    }

    return orderedKeys.filter(key => generalCardEnabledMap.value[key])
  })

  const homeQuickControlsEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'homeQuickControlsEnabled', true))

  const homeQuickControlOrder = computed<HomeQuickControlKey[]>(() => {
    const settings = themeSettings.value
    const preset = parseHomeQuickControlPreset(settings.homeQuickControlPreset)
    if (preset === 'custom') {
      return normalizeHomeQuickControlOrder(
        parseKeyList(settings.homeQuickControlKeys, isHomeQuickControlKey, DEFAULT_HOME_QUICK_CONTROL_ORDER),
      )
    }

    if (typeof settings.homeQuickControlKeys === 'string' && typeof settings.homeQuickControlPreset !== 'string') {
      return normalizeHomeQuickControlOrder(
        parseKeyList(settings.homeQuickControlKeys, isHomeQuickControlKey, DEFAULT_HOME_QUICK_CONTROL_ORDER),
      )
    }

    return normalizeHomeQuickControlOrder([...HOME_QUICK_CONTROL_PRESETS[preset]])
  })

  const homeQuickDefaultControl = computed<HomeQuickControlKey>(() => {
    const value = themeSettings.value.homeQuickDefaultControl
    if (typeof value === 'string' && isHomeQuickControlKey(value) && homeQuickControlOrder.value.includes(value))
      return value
    return 'default'
  })

  const nodeListMetadataEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'nodeListMetadataEnabled', true))

  const nodeListMetadataFields = computed<NodeListMetadataField[]>(() => {
    return parseKeyList(themeSettings.value.nodeListMetadataFields, isNodeListMetadataField, DEFAULT_NODE_LIST_METADATA_FIELDS)
  })

  const nodeListCustomTagsVisible = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'nodeListCustomTagsVisible', true))

  const nodeDetailSectionTabsEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'nodeDetailSectionTabsEnabled', false))

  const offlineNodesLast = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'offlineNodesLast', false))

  const homeHighLoadThreshold = computed<number>(() => readNumberSetting(themeSettings.value, 'homeHighLoadThreshold', 80, 1, 100))

  const homeTrafficWarningThreshold = computed<number>(() => readNumberSetting(themeSettings.value, 'homeTrafficWarningThreshold', 80, 1, 100))

  const homeExpiringDays = computed<number>(() => readNumberSetting(themeSettings.value, 'homeExpiringDays', 30, 1, 3650))

  const hideAdminEntryWhenLoggedOut = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'hideAdminEntryWhenLoggedOut', false))

  const hidePriceWhenLoggedOut = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'hidePriceWhenLoggedOut', false))

  const providerAliases = computed<string>(() => {
    const value = themeSettings.value.providerAliases
    if (typeof value === 'string')
      return value.trim()
    return ''
  })

  const disablePageAnimation = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'disablePageAnimation', false))

  // 计算属性：自定义背景配置
  const backgroundEnabled = computed<boolean>(() => readBooleanSetting(themeSettings.value, 'backgroundEnabled', false))

  const backgroundType = computed<'image' | 'video'>(() => {
    const settings = themeSettings.value
    if (typeof settings.backgroundType === 'string') {
      const type = settings.backgroundType
      if (type === 'image' || type === 'video') {
        return type
      }
    }
    return 'image'
  })

  const lightBackgroundUrl = computed<string>(() => {
    const value = themeSettings.value.lightBackgroundUrl
    if (typeof value === 'string')
      return value.trim()
    return ''
  })

  const darkBackgroundUrl = computed<string>(() => {
    const value = themeSettings.value.darkBackgroundUrl
    if (typeof value === 'string')
      return value.trim()
    return ''
  })

  const backgroundBlur = computed<number>(() => readNumberSetting(themeSettings.value, 'backgroundBlur', 0, 0, Number.MAX_SAFE_INTEGER))

  const backgroundOverlay = computed<number>(() => readNumberSetting(themeSettings.value, 'backgroundOverlay', 0, -100, 100))

  // 当 publicSettings 加载后，如果 localStorage 没有保存过视图模式或值为非法值，使用默认值
  watch(publicSettings, (settings) => {
    if (settings && !isValidViewMode(storedViewMode.value)) {
      // 触发 computed setter，会自动保存到 localStorage
      storedViewMode.value = defaultViewMode.value
    }
  }, { immediate: true })

  watch(themeMode, (mode) => {
    if (!isValidThemeMode(mode)) {
      themeMode.value = 'auto'
    }
  }, { immediate: true })

  const managedThemeMode = computed<ManagedThemeMode>(() => {
    const value = themeSettings.value.themeMode
    return isValidManagedThemeMode(value) ? value : 'beijing'
  })

  const isBeijingDaytime = computed<boolean>(() => {
    const hour = getBeijingHour(beijingTimeTick.value)
    return hour >= 7 && hour < 19
  })

  // 计算当前是否为暗色模式。本机按钮选择 auto 时跟随后台托管设置；手动选择浅色/深色时仅覆盖当前浏览器。
  const isDark = computed(() => {
    const localMode = isValidThemeMode(themeMode.value) ? themeMode.value : 'auto'
    if (localMode === 'light')
      return false
    if (localMode === 'dark')
      return true

    if (managedThemeMode.value === 'beijing')
      return !isBeijingDaytime.value

    return managedThemeMode.value === 'dark'
  })

  const resolvedThemeMode = computed<'light' | 'dark'>(() => isDark.value ? 'dark' : 'light')

  // 计算属性：当前主题模式下的背景 URL
  const currentBackgroundUrl = computed<string>(() => {
    if (resolvedThemeMode.value === 'dark') {
      return darkBackgroundUrl.value
    }
    return lightBackgroundUrl.value
  })

  function updateThemeMode(mode?: ThemeMode) {
    if (mode) {
      themeMode.value = isValidThemeMode(mode) ? mode : 'auto'
      return
    }

    const nextMode: Record<ThemeMode, ThemeMode> = {
      auto: 'light',
      light: 'dark',
      dark: 'auto',
    }

    const currentMode = isValidThemeMode(themeMode.value) ? themeMode.value : 'auto'
    themeMode.value = nextMode[currentMode]
  }

  function updateLoginState(loggedIn: boolean) {
    isLoggedIn.value = loggedIn
  }

  return {
    loading,
    themeMode,
    managedThemeMode,
    isBeijingDaytime,
    isDark,
    resolvedThemeMode,
    lang,
    nodeSelectedGroup,
    nodeViewMode,
    defaultViewMode,
    nodeCardSize,
    rpcTransportMode,
    byteDecimals,
    alertEnabled,
    alertTitle,
    alertContent,
    dataUpdateInterval,
    stopEarth,
    earthRenderer,
    hideEarth,
    hideGeneralCard,
    visitorInfoEnabled,
    generalCardEnabledMap,
    generalCardOrder,
    homeQuickControlsEnabled,
    homeQuickControlOrder,
    homeQuickDefaultControl,
    nodeListMetadataEnabled,
    nodeListMetadataFields,
    nodeListCustomTagsVisible,
    nodeDetailSectionTabsEnabled,
    offlineNodesLast,
    homeHighLoadThreshold,
    homeTrafficWarningThreshold,
    homeExpiringDays,
    hideAdminEntryWhenLoggedOut,
    hidePriceWhenLoggedOut,
    providerAliases,
    disablePageAnimation,
    backgroundEnabled,
    backgroundType,
    lightBackgroundUrl,
    darkBackgroundUrl,
    currentBackgroundUrl,
    backgroundBlur,
    backgroundOverlay,
    isLoggedIn,
    publicSettings,
    connectionError,
    homeScrollPosition,
    updateThemeMode,
    updateLoginState,
  }
})

export { useAppStore }
