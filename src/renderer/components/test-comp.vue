<template>
  <div class="progress-btn-container">
    <div :class="buttonClass" :style="labelStyle" @click="startProgress">
      <div class="circle" :style="circleStyle">
        <svg
          class="icon"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 19V5m0 14-4-4m4 4 4-4"
          ></path>
        </svg>
      </div>
      <div class="square">
        <svg
          class="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <path class="checkmark__check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount } from 'vue'

type Status = 'idle' | 'running' | 'completed'

const status = ref<Status>('idle')
const progress = ref(0)
const animationFrameId = ref<number | null>(null)

const buttonClass = computed(() => [
  'label',
  {
    active: status.value === 'running',
    completed: status.value === 'completed',
  },
])

const circleStyle = computed(() => {
  if (status.value === 'running') {
    return {
      '--progress-height': `${progress.value}%`,
      'background-color': 'transparent',
    }
  }
  if (status.value === 'completed') {
    return { '--progress-height': '100%' }
  }
  return { '--progress-height': '0%' }
})

const labelStyle = computed(() => {
  if (status.value === 'running') {
    const rotation = -90 + (360 * progress.value) / 100
    return {
      '--progress-transform': `rotate(${rotation}deg) translate(20px) rotate(${rotation}deg)`,
    }
  }
  return {}
})

const startProgress = () => {
  if (status.value === 'running') return
  if (status.value === 'completed') {
    resetProgress()
    return
  }

  status.value = 'running'
  progress.value = 0

  const duration = 3500 // 动画持续时间 (ms)
  let startTime: number | null = null

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsedTime = timestamp - startTime
    const currentProgress = Math.min((elapsedTime / duration) * 100, 100)
    progress.value = currentProgress

    if (elapsedTime < duration) {
      animationFrameId.value = requestAnimationFrame(animate)
    } else {
      status.value = 'completed'
      animationFrameId.value = null
    }
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

const resetProgress = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
  status.value = 'idle'
  progress.value = 0
}

onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped lang="scss">
/* Progress Button Styles */
.progress-btn-container {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.label {
  background-color: transparent;
  border: 2px solid #1989fa;
  display: flex;
  align-items: center;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s ease;
  padding: 5px;
  position: relative;
}

.label .title {
  margin: 0 10px;
  font-size: 14px;
  color: #333;
  transition: all 0.4s ease;
  text-align: center;
}

.label .circle {
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background-color: #1989fa;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.4s ease;
  position: relative;
  box-shadow: 0 0 0 0 #1989fa;
  overflow: hidden;
}

.label .circle .icon {
  color: #fff;
  width: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s ease;
}

.label .square {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transform: scale(0);
  transition: transform 0.4s ease;
}

.checkmark {
  stroke-width: 3;
  stroke: #23ae23;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.checkmark__check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
}

.label.completed .checkmark__check {
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;
}

.label .circle::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  background-color: #1989fa;
  width: 100%;
  height: var(--progress-height, 0%);
  transition: height 0.1s linear;
}

.label::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1989fa;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  margin: auto;
  opacity: 0;
  visibility: hidden;
  transform: var(
    --progress-transform,
    'rotate(-90deg) translate(17px) rotate(0)'
  );
}

/* Active state (progress running) */
.label.active {
  width: 42px;
}

.label.active::before {
  opacity: 1;
  visibility: visible;
}

.label.active .circle {
  animation: pulse 1s forwards;
  rotate: 180deg;
}

.label.active .circle .icon {
  opacity: 0;
  visibility: hidden;
}

.label.active .title {
  opacity: 0;
  visibility: hidden;
}

/* Completed state */
.label.completed {
  border-color: rgb(35, 174, 35);
}

.label.completed::before {
  opacity: 0;
  visibility: hidden;
}

.label.completed .circle {
  transform: scale(0);
  opacity: 0;
  visibility: hidden;
}

.label.completed .square {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}

.label.completed .title:last-child {
  opacity: 1;
  visibility: visible;
  animation: showInstalledMessage 0.4s ease forwards;
}

/* Animations */
@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes pulse {
  0% {
    scale: 0.95;
    box-shadow: 0 0 0 0 rgba(25, 137, 250, 0.702);
  }

  70% {
    scale: 1;
    box-shadow: 0 0 0 16px rgba(91, 91, 240, 0);
  }

  100% {
    scale: 0.95;
    box-shadow: 0 0 0 0 rgba(91, 91, 240, 0);
  }
}

@keyframes showInstalledMessage {
  100% {
    opacity: 1;
    visibility: visible;
    right: 48px;
  }
}
</style>
