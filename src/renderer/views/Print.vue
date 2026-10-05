<template>
  <div class="print column">
    <div class="row">
      <span class="tips">{{ t('print.tips') }}</span>
    </div>
    <div class="row">
      <el-select class="grip-right w-200" v-model="selName">
        <el-option
          v-for="(item, index) in printers"
          :key="index"
          :value="item.name"
        >
          {{ item.displayName }}
        </el-option>
      </el-select>
      <el-button type="button" @click="print">{{ t('print.print') }}</el-button>
    </div>
    <div class="row">
      <el-button
        class="grip-right"
        type="button"
        @click="() => (silent = !silent)"
      >
        {{ silent ? '' : t('print.notUse') }}{{ t('print.silentPrinting') }}
      </el-button>
      <el-button
        class="grip-right"
        type="button"
        @click="() => (printBackground = !printBackground)"
      >
        {{ printBackground ? t('print.use') : t('print.unuse')
        }}{{ t('print.backgroundColor') }}
      </el-button>
      <el-button type="button" @click="() => (color = !color)">
        {{ color ? t('print.colorful') : t('print.blackAndWhite') }}
      </el-button>
    </div>
    <div class="line"></div>
    <div class="row">
      <span class="grip-right">{{ t('print.margin') }}:</span>
      <el-select class="grip-right w-200" v-model="margins.marginType">
        <el-option
          v-for="(item, index) in marginTypes"
          :key="index"
          :value="item"
        >
          {{ item }}
        </el-option>
      </el-select>
    </div>
    <div v-show="margins.marginType === 'custom'" class="row">
      <label class="grip-right">
        {{ t('print.top') }}{{ t('print.margin') }}:
        <input class="small" v-model.number="margins.top" />
        px
      </label>
      <label class="grip-right">
        {{ t('print.bottom') }}{{ t('print.margin') }}:
        <input class="small" v-model.number="margins.bottom" />
        px
      </label>
      <label class="grip-right">
        {{ t('print.left') }}{{ t('print.margin') }}:
        <input class="small" v-model.number="margins.left" />
        px
      </label>
      <label class="grip-right">
        {{ t('print.right') }}{{ t('print.margin') }}:
        <input class="small" v-model.number="margins.right" />
        px
      </label>
    </div>
    <div class="line"></div>
    <div class="row">
      <span class="grip-right">尺寸:</span>
      <!-- <div class="fake-radio"  @click="() => selPageSizeType = 0">{{ selPageSizeType === 0 ? '√' : '' }}</div> -->
      <el-select class="grip-right w-200" v-model="pageSizeString">
        <el-option
          v-for="(item, index) in pageSizeOptions"
          :key="index"
          :value="item"
        >
          {{ item }}
        </el-option>
      </el-select>
    </div>
    <!-- 设置宽高变成A4 大概哪里不对 -->
    <!-- <div class="row">
      <span class="grip-right">&emsp;&emsp;&nbsp;</span>
      <div class="fake-radio" @click="() => selPageSizeType = 1">{{ selPageSizeType === 1 ? '√' : '' }}</div>
      <label class="grip-right">宽度: <input class="normal" v-model.number="pageSizeObject.width" />μm</label>
      <label class="grip-right">高度: <input class="normal" v-model.number="pageSizeObject.height" />μm</label>
      <span class="tips">1mm = 1000μm</span>
    </div>-->
    <div class="line"></div>
    <div class="row">
      <div
        style="width: 100px; height: 100px; background: red"
        class="grip-right"
      ></div>
      <img
        style="width: 100px; height: 100px; object-fit: cover"
        src="https://img2.baidu.com/it/u=2173864545,554093748&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=882"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { invoke, IpcChannel } from '../utils/ipcRenderer'
import type { WebContentsPrintOptions } from 'electron'

const selName = ref('')
const printers = ref<Electron.PrinterInfo[]>([])
const silent = ref(false)
const printBackground = ref(false)
const color = ref(true)
const marginTypes = ref(['default', 'none', 'printableArea', 'custom'])
const margins: Ref<WebContentsPrintOptions['margins']> = ref({
  marginType: 'default',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
})
const pageSizeString = ref<string>('A4')
const pageSizeOptions = ref(['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'])
const pageSizeObject = ref({ width: 210000, height: 297000 })
const selPageSizeType = ref(0) // 0 string  1 Size
onMounted(async () => {
  // 获取打印机列表
  printers.value = await invoke(IpcChannel.GetPrinters)
  if (printers.value.length) {
    const defaultItem = printers.value.find((v) => v.isDefault)
    if (defaultItem) {
      selName.value = defaultItem.name
    } else {
      selName.value = printers.value[0].name
    }
  }
})

const { t } = useI18n()

async function print() {
  if (selName.value) {
    const printRes = await invoke(IpcChannel.PrintHandlePrint, {
      silent: silent.value,
      deviceName: selName.value,
      printBackground: printBackground.value,
      color: color.value,
      margins: toRaw(margins.value),
      pageSize:
        selPageSizeType.value === 0
          ? toRaw(pageSizeString.value)
          : toRaw(pageSizeObject.value),
    })
    console.info(printRes)
  }
}
</script>
<style scoped>
.print {
  overflow: auto;
  user-select: none;
}

.tips {
  color: red;
}

.print {
  height: 100vh;
  padding: 10px;
  border: 1px solid blue;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.column {
  display: flex;
  flex-direction: column;
}

.grip-right {
  margin-right: 10px;
}

.w-200 {
  width: 200px;
}

.fake-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 20px;
  border: 1px solid #000;
  border-radius: 4px;
  margin-right: 10px;
}

.line {
  min-height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}
</style>
