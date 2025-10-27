<template>
  <div class="browser">
    <div class="tabbar" :class="{ 'use-transition': useTransition }">
      <template v-for="(item, index) in tabList" :key="index">
        <div class="spacer" :class="{ active: index === moveToIndex }"></div>
        <div
          class="tab-item"
          :style="{ left: item.positionX }"
          :class="{
            active:
              activeBrowserContentViewWebContentsId ===
              item.browserContentViewWebContentsId,
            dragging: item.positionX,
          }"
          @mousedown="mousedownHandle($event, item)"
          @mouseup.stop="mouseupHandle"
        >
          {{ item.title }}
          <div class="close-btn" @click="bvCloseHandle(item)">×</div>
        </div>
      </template>
      <div
        class="spacer"
        :class="{ active: tabList.length === moveToIndex }"
      ></div>
      <div class="add-btn" @click="createDefaultBrowserView">+</div>
    </div>
    <div class="search-bar">
      <input
        v-model="searchKey"
        type="text"
        class="search-input"
        :placeholder="t('browser.searchBarPlaceholder')"
        @keydown.enter="searchHandle"
        @focus="focusHandle"
        @blur="blurHandle"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vueListen, invoke, IpcChannel } from '../utils/ipcRenderer'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface TabItemData {
  browserContentViewWebContentsId: number
  title: string
  url: string
  positionX?: string
}

const useTransition = ref(true)
const moveToIndex = ref(-1)
const tabList = ref<TabItemData[]>([])
const activeBrowserContentViewWebContentsId = ref<number>()

onMounted(async () => {
  const isNewTabContainer = localStorage.getItem('isNewTabContainer')
  if (isNewTabContainer) {
    localStorage.removeItem('isNewTabContainer')
    // 作为拖出tab的容器
    const data = await invoke(IpcChannel.GetLastBrowserDemoTabData)
    if (data) {
      tabList.value.push({
        positionX: data.positionX === -1 ? '' : data.positionX + 'px',
        browserContentViewWebContentsId: data.browserContentViewWebContentsId,
        title: data.title,
        url: data.url,
      })
      activeBrowserContentViewWebContentsId.value =
        data.browserContentViewWebContentsId
    }
  } else {
    // 打开默认状态
    createDefaultBrowserView()
  }
})

async function createDefaultBrowserView() {
  try {
    console.log('createDefaultBrowserView called')
    const { browserContentViewWebContentsId } = await invoke(
      IpcChannel.AddDefaultBrowserView,
    )
    if (browserContentViewWebContentsId !== -1) {
      activeBrowserContentViewWebContentsId.value =
        browserContentViewWebContentsId
      console.log(
        'New BrowserView created with id:',
        browserContentViewWebContentsId,
      )
    } else {
      console.warn('Failed to create BrowserView')
    }
  } catch (error) {
    console.error('createDefaultBrowserView error:', error)
  }
}

// 点击切换tab
async function bvSelectHandle(item: TabItemData) {
  try {
    console.log(
      'bvSelectHandle called for tab:',
      item.browserContentViewWebContentsId,
    )
    if (
      activeBrowserContentViewWebContentsId.value !==
      item.browserContentViewWebContentsId
    ) {
      const success = await invoke(
        IpcChannel.SelectBrowserDemoTab,
        item.browserContentViewWebContentsId,
      )
      if (success) {
        activeBrowserContentViewWebContentsId.value =
          item.browserContentViewWebContentsId
        searchKey.value = item.url
        console.log(
          'Tab selected successfully:',
          item.browserContentViewWebContentsId,
        )
      } else {
        console.warn(
          'Failed to select tab:',
          item.browserContentViewWebContentsId,
        )
      }
    }
  } catch (error) {
    console.error('bvSelectHandle error:', error)
  }
}

// 关闭tab
async function bvCloseHandle(item: TabItemData) {
  try {
    console.log(
      'bvCloseHandle called for tab:',
      item.browserContentViewWebContentsId,
    )
    await invoke(
      IpcChannel.DestroyBrowserDemoTab,
      item.browserContentViewWebContentsId,
    )
    const findIndex = tabList.value.findIndex((v) => v === item)
    if (findIndex !== -1) {
      tabList.value.splice(findIndex, 1)
      console.log('Tab removed from UI:', item.browserContentViewWebContentsId)
    }
    if (
      activeBrowserContentViewWebContentsId.value ===
      item.browserContentViewWebContentsId
    ) {
      if (tabList.value.length > 1) {
        const newIndex = findIndex > 0 ? findIndex - 1 : 0
        await bvSelectHandle(tabList.value[newIndex])
      } else if (tabList.value.length === 1) {
        await bvSelectHandle(tabList.value[0])
      } else {
        // 所有tab都关闭了，重置状态
        activeBrowserContentViewWebContentsId.value = undefined
        searchKey.value = ''
      }
    }
  } catch (error) {
    console.error('bvCloseHandle error:', error)
  }
}

// 搜索
const searchKey = ref('')
async function searchHandle() {
  let url: URL
  try {
    url = new URL(searchKey.value)
  } catch {
    const query = encodeURIComponent(searchKey.value)
    url = new URL(`https://www.bing.com/search?q=${query}`)
  }
  await invoke(IpcChannel.BrowserDemoTabJumpToUrl, {
    url: url.href,
    browserContentViewWebContentsId:
      activeBrowserContentViewWebContentsId.value,
  })
}

let isFocused = false
function focusHandle() {
  isFocused = true
}
function blurHandle() {
  isFocused = false
}

// 监听tab信息更新
vueListen(
  IpcChannel.BrowserViewTabDataUpdate,
  (event, { browserContentViewWebContentsId, title, url, status }) => {
    console.log(
      'Received tab data update:',
      browserContentViewWebContentsId,
      title,
      url,
      status,
    )
    const findIndex = tabList.value.findIndex(
      (tab) =>
        tab.browserContentViewWebContentsId === browserContentViewWebContentsId,
    )
    if (status === 1) {
      if (findIndex !== -1) {
        tabList.value[findIndex].title = title
        tabList.value[findIndex].url = url
        if (
          browserContentViewWebContentsId ===
            activeBrowserContentViewWebContentsId.value &&
          !isFocused
        ) {
          searchKey.value = url
        }
      } else {
        tabList.value.push({
          browserContentViewWebContentsId,
          title,
          url,
        })
        if (!isFocused) {
          searchKey.value = url
        }
        activeBrowserContentViewWebContentsId.value =
          browserContentViewWebContentsId
      }
    } else {
      if (findIndex !== -1) {
        tabList.value.splice(findIndex, 1)
        let nextIndex = findIndex
        if (nextIndex >= tabList.value.length - 1) {
          nextIndex = tabList.value.length - 1
        }
        if (nextIndex >= 0) {
          bvSelectHandle(tabList.value[nextIndex])
        }
      }
      resetPosition()
    }
  },
)

// 监听拖拽tab位置更新
let lastDragBrowserContentViewWebContentsId: number
vueListen(
  IpcChannel.BrowserViewTabPositionXUpdate,
  (event, { positionX, browserContentViewWebContentsId, dragTabOffsetX }) => {
    lastDragBrowserContentViewWebContentsId = browserContentViewWebContentsId
    const findIndex = tabList.value.findIndex(
      (v) =>
        v.browserContentViewWebContentsId === browserContentViewWebContentsId,
    )
    if (findIndex !== -1) {
      const totalWidth = document.body.clientWidth - 40 // 添加按钮的占位
      const eachWidth = Math.min(200, totalWidth / tabList.value.length)

      let floorIndex = Math.floor(positionX / eachWidth)

      if (floorIndex > findIndex) {
        floorIndex += 1
      }
      if (floorIndex > tabList.value.length) {
        floorIndex = tabList.value.length
      }

      if (moveToIndex.value === -1) {
        useTransition.value = false
        setTimeout(() => {
          useTransition.value = true
        }, 100)
      }
      moveToIndex.value = floorIndex
      tabList.value[findIndex].positionX = positionX - dragTabOffsetX + 'px'
      tabList.value.map((v, i) => {
        if (i !== findIndex) {
          v.positionX = ''
        }
      })
    }
  },
)

// 鼠标松开
vueListen(IpcChannel.BrowserTabMouseup, (event) => {
  resetPosition()
})

// 重置拖拽效果
function resetPosition() {
  useTransition.value = false
  setTimeout(() => {
    useTransition.value = true
  }, 100)
  tabList.value.map((v) => {
    v.positionX = ''
  })
  if (lastDragBrowserContentViewWebContentsId && moveToIndex.value !== -1) {
    const findIndex = tabList.value.findIndex(
      (v) =>
        v.browserContentViewWebContentsId ===
        lastDragBrowserContentViewWebContentsId,
    )
    if (findIndex !== -1) {
      tabList.value.splice(
        moveToIndex.value,
        0,
        tabList.value.splice(findIndex, 1)[0],
      )
    }
  }
  moveToIndex.value = -1
}

// 拖拽逻辑 start
let dragging = false
let startPosition = { x: 0, y: 0 }
let mousedownTime: number
let mousedownItem: TabItemData
function mousedownHandle(e: MouseEvent, item: TabItemData) {
  localStorage.setItem('isNewTabContainer', 'true')
  e.preventDefault()
  mousedownItem = item
  mousedownTime = Date.now()
  dragging = true
  startPosition = { x: e.x, y: e.y }
  invoke(IpcChannel.BrowserTabMousedown, {
    offsetX: e.offsetX,
  })
}

document.onmouseup = (e) => {
  mouseupHandle(e)
}

function mouseupHandle(e: MouseEvent) {
  localStorage.removeItem('isNewTabContainer')
  if ((e.target as HTMLDivElement).className !== 'close-btn') {
    if (Date.now() - mousedownTime < 200) {
      // 按下松开200ms间隔内判断为点击时间
      bvSelectHandle(mousedownItem)
    } else if (dragging) {
      invoke(IpcChannel.BrowserTabMouseup)
    }
  }

  dragging = false
}

document.onmousemove = (e) => {
  if (dragging) {
    invoke(IpcChannel.BrowserTabMousemove, {
      screenX: e.screenX, // 鼠标在显示器的x坐标
      screenY: e.screenY, // 鼠标在显示器的y坐标
      startX: startPosition.x, // 按下鼠标时在窗口的x坐标
      startY: startPosition.y, // 按下鼠标时在窗口的y坐标
      browserContentViewWebContentsId:
        mousedownItem.browserContentViewWebContentsId,
    })
  }
}

// 拖拽逻辑 end
</script>
<style scoped>
.tabbar {
  position: relative;
  display: flex;
  width: 100%;
  height: 40px;
  background-color: #fafafa;
  user-select: none;
}
.use-transition .spacer {
  transition: width 200ms ease-in-out;
}
.spacer {
  width: 0;
}
.spacer.active {
  width: 200px;
}
.tab-item {
  position: relative;
  width: 200px;
  font-size: 12px;
  line-height: 40px;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 30px;
  border-radius: 8px;
  border-right: 1px solid #f0f0f0;
  overflow: hidden;
  cursor: pointer;
}
.tab-item.active {
  background-color: #fff;
}
.tab-item:not(.active):hover {
  background-color: #f0f0f0;
}
.tab-item.dragging {
  position: absolute;
  background-color: #fafafa;
  z-index: 2;
}
.close-btn {
  position: absolute;
  top: 50%;
  right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-weight: bold;
  padding-bottom: 2px;
  border-radius: 50%;
  transform: translateY(-50%);
}
.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  width: 30px;
  height: 30px;
  font-size: 18px;
  line-height: 1;
  font-weight: bold;
  padding-bottom: 3px;
  border-radius: 50%;
  margin: 5px 5px 0 5px;
  cursor: pointer;
}
.add-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 10px;
}
.search-input {
  width: 100%;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  border: none;
  border-radius: 30px;
  outline: none;
}
</style>
