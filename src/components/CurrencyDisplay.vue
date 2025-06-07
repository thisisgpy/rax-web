<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useCurrencySettings, CURRENCY_CONFIG } from '@/composables/useCurrencySettings'
import Decimal from 'decimal.js'

/** 组件 Props */
interface Props {
  /** 金额值（固定以分为单位传入，如：100分 = 1元） */
  value: number
}

const props = defineProps<Props>()

/** 货币设置 */
const { globalSettings } = useCurrencySettings()

/** 强制刷新计数器 */
const refreshKey = ref(0)

/** 监听全局设置变化，强制刷新组件 */
watch(
  globalSettings,
  () => {
    refreshKey.value++
    console.log('CurrencyDisplay: 全局设置已更新', globalSettings.value)
  },
  { deep: true, immediate: true }
)

/** 固定尺寸配置（用于表格显示） */
const miniSize = {
  integerSize: '14px',
  decimalSize: '12px',
  unitSize: '12px',
  gap: '2px'
}

/** 格式化货币金额 */
const formatCurrency = (amountInCents: number): string => {
  // 获取当前设置
  const unit = globalSettings.value.currencyUnit
  const decimal = globalSettings.value.decimalPlaces
  
  // 获取货币配置
  const config = CURRENCY_CONFIG[unit as keyof typeof CURRENCY_CONFIG]
  if (!config) {
    console.warn(`未知的货币单位: ${unit}`)
    return amountInCents.toFixed(2)
  }
  
  // 使用 Decimal.js 进行精确的货币单位转换
  let convertedAmount: number
  try {
    const decimalAmount = new Decimal(amountInCents)
    const divisorDecimal = new Decimal(config.divisor)
    convertedAmount = decimalAmount.dividedBy(divisorDecimal).toNumber()
  } catch (error) {
    console.error('Decimal 货币转换错误:', error)
    convertedAmount = amountInCents / config.divisor // 降级处理
  }
  
  // 智能小数位数处理：确保小额不会显示为0
  let actualDecimal = decimal
  if (convertedAmount !== 0 && Math.abs(convertedAmount) < 1) {
    // 计算需要多少位小数才能显示有意义的数字
    const absAmount = Math.abs(convertedAmount)
    let requiredDecimal = decimal
    
    if (absAmount >= 0.1) {
      requiredDecimal = Math.max(decimal, 1)
    } else if (absAmount >= 0.01) {
      requiredDecimal = Math.max(decimal, 2)
    } else if (absAmount >= 0.001) {
      requiredDecimal = Math.max(decimal, 3)
    } else if (absAmount >= 0.0001) {
      requiredDecimal = Math.max(decimal, 4)
    } else if (absAmount >= 0.00001) {
      requiredDecimal = Math.max(decimal, 5)
    } else if (absAmount >= 0.000001) {
      requiredDecimal = Math.max(decimal, 6)
    } else {
      requiredDecimal = Math.max(decimal, 8) // 最多8位小数
    }
    
    actualDecimal = requiredDecimal
  }
  
  // 确保小数位数不会过度增长，并且至少显示2位小数
  actualDecimal = Math.max(Math.min(actualDecimal, 8), 2)
  
  // 使用 Decimal.js 进行精确的小数位格式化
  let formattedAmount: string
  try {
    const decimalAmountForFormat = new Decimal(convertedAmount)
    formattedAmount = decimalAmountForFormat.toFixed(actualDecimal)
  } catch (error) {
    console.error('Decimal 格式化错误:', error)
    formattedAmount = convertedAmount.toFixed(actualDecimal) // 降级处理
  }
  
  // 添加千分位分隔符
  const parts = formattedAmount.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const finalAmount = parts.join('.')
  
  return `${finalAmount} ${config.label}`
}

/** 格式化后的金额信息 */
const formattedAmount = computed(() => {
  // 使用 refreshKey 确保响应式更新
  refreshKey.value

  // 获取分值（props.value 现在固定为 number 类型）
  const amountInCents = props.value

  const formatted = formatCurrency(amountInCents)
  
  // 不处理负号，保持原样显示（包括负号）
  const cleanFormatted = formatted

  // 分离整数部分、小数部分和单位
  const parts = cleanFormatted.split(' ')
  const numberPart = parts[0]
  const unitPart = parts.length > 1 ? parts[1] : ''

  // 分离整数和小数
  const [integerPart, decimalPart] = numberPart.split('.')

  return {
    integer: integerPart,
    decimal: decimalPart ? `.${decimalPart}` : '',
    unit: unitPart
  }
})

/** 组件样式 */
const componentStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: miniSize.gap,
  fontFamily: '"SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif',
  fontWeight: '500',
  color: '#303133'
}))

/** 整数部分样式 */
const integerStyle = computed(() => ({
  fontSize: miniSize.integerSize,
  fontWeight: '600',
  lineHeight: '1'
}))

/** 小数部分样式 */
const decimalStyle = computed(() => ({
  fontSize: miniSize.decimalSize,
  fontWeight: '400',
  opacity: '0.8',
  lineHeight: '1'
}))

/** 单位样式 */
const unitStyle = computed(() => ({
  fontSize: miniSize.unitSize,
  fontWeight: '400',
  opacity: '0.9',
  marginLeft: '4px',
  lineHeight: '1'
}))
</script>

<template>
  <span 
    class="currency-display"
    :style="componentStyle"
  >
    <!-- 整数部分 -->
    <span 
      class="currency-integer"
      :style="integerStyle"
    >
      {{ formattedAmount.integer }}
    </span>

    <!-- 小数部分 -->
    <span 
      v-if="formattedAmount.decimal"
      class="currency-decimal"
      :style="decimalStyle"
    >
      {{ formattedAmount.decimal }}
    </span>

    <!-- 货币单位 -->
    <span 
      v-if="formattedAmount.unit"
      class="currency-unit"
      :style="unitStyle"
    >
      {{ formattedAmount.unit }}
    </span>
  </span>
</template>

<style scoped>
.currency-display {
  user-select: text;
  letter-spacing: 0.5px;
}
</style> 