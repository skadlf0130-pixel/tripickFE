<!-- 기본 레이아웃: 헤더 + 콘텐츠 + 하단 탭 네비게이션 -->
<!-- #header 슬롯 사용 시 AppHeader 대신 커스텀 헤더 렌더링 -->
<script setup>
import AppHeader from '../common/AppHeader.vue'
import BottomNav from '../common/BottomNav.vue'

defineProps({
  title:      { type: String,  default: '' },
  showBack:   { type: Boolean, default: false },
  showHeader: { type: Boolean, default: true },
})
</script>

<template>
  <div class="layout">
    <!-- 커스텀 헤더 슬롯이 있으면 AppHeader 대신 사용 -->
    <div v-if="$slots.header" class="layout__header">
      <slot name="header" />
    </div>
    <AppHeader v-else-if="showHeader" :title="title" :show-back="showBack">
      <template #actions>
        <slot name="header-actions" />
      </template>
    </AppHeader>

    <main class="layout__main">
      <slot />
    </main>

    <BottomNav />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-bg);
}

.layout__header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--c-surface);
}

.layout__main {
  flex: 1;
  padding-bottom: var(--nav-height);
  overflow-y: auto;
}
</style>
