<!-- 상단 헤더 — 뒤로가기(‹), 타이틀, 오른쪽 액션 슬롯 -->
<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title:    { type: String,  default: '' },
  showBack: { type: Boolean, default: true },
  transparent: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])
const router = useRouter()

function handleBack() {
  emit('back')
  router.back()
}
</script>

<template>
  <header class="app-header" :class="{ 'app-header--transparent': transparent }">
    <button v-if="showBack" class="app-header__back" @click="handleBack" aria-label="뒤로가기">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 6l-6 6 6 6"/>
      </svg>
    </button>
    <div v-else class="app-header__spacer" />

    <h1 class="app-header__title">{{ title }}</h1>

    <div class="app-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  z-index: 100;
}

.app-header--transparent {
  background: transparent;
  border-bottom: none;
}

.app-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  padding: 0;
  color: var(--c-text);
  border-radius: var(--r-pill);
  margin-right: 4px;
}

.app-header__spacer {
  width: 40px;
}

.app-header__title {
  flex: 1;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--c-text);
  text-align: center;
}

.app-header__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 40px;
  justify-content: flex-end;
}
</style>
