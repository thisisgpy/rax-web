<template>
  <div class="icon-selector">
    <el-input
      :model-value="modelValue"
      placeholder="请选择图标"
      readonly
      @click="dialogVisible = true"
    >
      <template #prefix>
        <el-icon v-if="modelValue" :size="16">
          <component :is="modelValue" />
        </el-icon>
      </template>
      <template #suffix>
        <el-icon>
          <ArrowDown />
        </el-icon>
      </template>
    </el-input>

    <el-dialog
      v-model="dialogVisible"
      title="选择图标"
      width="720px"
      :close-on-click-modal="false"
    >
      <div class="icon-grid-container">
        <div class="icon-grid">
          <div
            v-for="iconName in allIcons"
            :key="iconName"
            class="icon-item"
            :class="{ active: selectedIcon === iconName }"
            @click="selectIcon(iconName)"
          >
            <el-icon :size="20">
              <component :is="iconName" />
            </el-icon>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const selectedIcon = ref(props.modelValue)

// 所有图标列表（扁平化，无分类）
const allIcons = [
  // 系统图标
  'Plus', 'Minus', 'CirclePlus', 'Search', 'Female', 'Male', 'Aim', 'House', 'FullScreen',
  'Loading', 'Link', 'Service', 'Pointer', 'Star', 'Notification', 'Connection', 'ChatDotRound',
  'Setting', 'Clock', 'Position', 'Discount', 'Odometer', 'ChatSquare', 'ChatRound', 'ChatLineRound',
  'ChatLineSquare', 'ChatDotSquare', 'View', 'Hide', 'Unlock', 'Lock', 'RefreshRight', 'RefreshLeft',
  'Refresh', 'Bell', 'MuteNotification', 'User', 'Check', 'CircleCheck', 'Warning', 'CircleClose',
  'Close', 'PieChart', 'More', 'Compass', 'Filter', 'Switch', 'Select', 'SemiSelect', 'CloseBold',
  'EditPen', 'Edit', 'Message', 'MessageBox', 'TurnOff', 'Finished', 'Delete', 'Crop', 'SwitchButton',
  'Operation', 'Open', 'Remove', 'ZoomOut', 'ZoomIn', 'InfoFilled', 'CircleCheckFilled', 'SuccessFilled',
  'WarningFilled', 'CircleCloseFilled', 'QuestionFilled', 'WarnTriangleFilled', 'UserFilled',
  'MoreFilled', 'Tools', 'HomeFilled', 'Menu', 'UploadFilled', 'Avatar', 'HelpFilled', 'Share',
  'StarFilled', 'Comment', 'Histogram', 'Grid', 'Promotion', 'DeleteFilled', 'RemoveFilled', 'CirclePlusFilled',
  
  // 箭头图标
  'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeftBold', 'ArrowUpBold', 'ArrowRightBold',
  'ArrowDownBold', 'DArrowRight', 'DArrowLeft', 'Download', 'Upload', 'Top', 'Bottom', 'Back', 'Right',
  'TopRight', 'TopLeft', 'BottomRight', 'BottomLeft', 'Sort', 'SortUp', 'SortDown', 'Rank',
  'CaretLeft', 'CaretTop', 'CaretRight', 'CaretBottom', 'DCaret', 'Expand', 'Fold',
  
  // 文档图标
  'DocumentAdd', 'Document', 'Notebook', 'Tickets', 'Memo', 'Collection', 'Postcard', 'ScaleToOriginal',
  'SetUp', 'DocumentDelete', 'DocumentChecked', 'DataBoard', 'DataAnalysis', 'CopyDocument',
  'FolderChecked', 'Files', 'Folder', 'FolderDelete', 'FolderRemove', 'FolderOpened', 'DocumentCopy',
  'DocumentRemove', 'FolderAdd', 'FirstAidKit', 'Reading', 'DataLine', 'Management', 'Checked',
  'Ticket', 'Failed', 'TrendCharts', 'List',
  
  // 媒体图标
  'Microphone', 'Mute', 'Mic', 'VideoPause', 'VideoCamera', 'VideoPlay', 'Headset', 'Monitor',
  'Film', 'Camera', 'Picture', 'PictureRounded', 'Iphone', 'Cellphone', 'VideoCameraFilled',
  'PictureFilled', 'Platform', 'CameraFilled', 'BellFilled',
  
  // 交通图标
  'Location', 'LocationInformation', 'DeleteLocation', 'Coordinate', 'Bicycle', 'OfficeBuilding',
  'School', 'Guide', 'AddLocation', 'MapLocation', 'Place', 'LocationFilled', 'Van',
  
  // 食物图标
  'Watermelon', 'Pear', 'NoSmoking', 'Smoking', 'Mug', 'GobletSquareFull', 'GobletFull', 'KnifeFork',
  'Sugar', 'Bowl', 'MilkTea', 'Lollipop', 'Coffee', 'Chicken', 'Dish', 'IceTea', 'ColdDrink',
  'CoffeeCup', 'DishDot', 'IceDrink', 'IceCream', 'Dessert', 'IceCreamSquare', 'ForkSpoon',
  'IceCreamRound', 'Food', 'HotWater', 'Grape', 'Fries', 'Apple', 'Burger', 'Goblet', 'GobletSquare',
  'Orange', 'Cherry',
  
  // 物品图标
  'Printer', 'Calendar', 'CreditCard', 'Box', 'Money', 'Refrigerator', 'Cpu', 'Football', 'Brush',
  'Suitcase', 'SuitcaseLine', 'Umbrella', 'AlarmClock', 'Medal', 'GoldMedal', 'Present', 'Mouse',
  'Watch', 'QuartzWatch', 'Magnet', 'Help', 'Soccer', 'ToiletPaper', 'ReadingLamp', 'Paperclip',
  'MagicStick', 'Basketball', 'Baseball', 'Coin', 'Goods', 'Sell', 'SoldOut', 'Key', 'ShoppingCart',
  'ShoppingCartFull', 'ShoppingTrolley', 'Phone', 'Scissor', 'Handbag', 'ShoppingBag', 'Trophy',
  'TrophyBase', 'Stopwatch', 'Timer', 'CollectionTag', 'TakeawayBox', 'PriceTag', 'Wallet',
  'Opportunity', 'PhoneFilled', 'WalletFilled', 'GoodsFilled', 'Flag', 'BrushFilled', 'Briefcase', 'Stamp',
  
  // 天气图标
  'Sunrise', 'Sunny', 'Ship', 'MostlyCloudy', 'PartlyCloudy', 'Sunset', 'Drizzling', 'Pouring',
  'Cloudy', 'Moon', 'MoonNight', 'Lightning',
  
  // 其他图标
  'ChromeFilled', 'Eleme', 'ElemeFilled', 'ElementPlus', 'Shop', 'SwitchFilled', 'WindPower'
]

// 选择图标
const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName
}

// 确认选择
const confirmSelection = () => {
  emit('update:modelValue', selectedIcon.value)
  dialogVisible.value = false
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue: string) => {
  selectedIcon.value = newValue
}, { immediate: true })
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-grid-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0;
  border: 1px solid var(--el-border-color-light);
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-right: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.icon-item:nth-child(10n) {
  border-right: none;
}

.icon-item:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}

.icon-item.active {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.dialog-footer {
  text-align: right;
  padding-top: 15px;
}

:deep(.el-input__inner) {
  cursor: pointer;
}

:deep(.el-dialog__body) {
  padding: 20px;
}
</style> 