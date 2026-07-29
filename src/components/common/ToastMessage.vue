<!-- 토스트 알림 — BottomNav 위에 표시, info/success/error 3가지 타입 -->
<script setup>
import { ref } from 'vue'

const toasts = ref([])
let idSeq = 0

function show(message, type = 'info', duration = 2500) {
  const id = ++idSeq
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div class="toast-wrap">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
        >
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-wrap {
  position: fixed;
  bottom: calc(var(--nav-height) + 12px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 300;
  pointer-events: none;
  width: max-content;
  max-width: calc(var(--max-width) - 48px);
}

.toast {
  padding: 12px 22px;
  border-radius: var(--r-pill);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  text-align: center;
}

.toast--info    { background: var(--c-text); }
.toast--success { background: var(--c-success); }
.toast--error   { background: var(--c-error); }

.toast-enter-active,
.toast-leave-active { transition: all 0.22s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(8px); }
.toast-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
