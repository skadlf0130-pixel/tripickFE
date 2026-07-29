<!-- 서브 레이아웃: 뒤로가기 헤더 + 콘텐츠 (하단 네비 없음) -->
<!-- 상세 페이지, 설정, 편집 등 서브 화면에 사용 -->
<script setup>
import AppHeader from '../common/AppHeader.vue'

defineProps({
  title: { type: String, default: '' },
  transparentHeader: { type: Boolean, default: false },
})
</script>

<template>
  <div class="sub-layout">
    <AppHeader :title="title" :show-back="true" :transparent="transparentHeader">
      <template #actions>
        <slot name="header-actions" />
      </template>
    </AppHeader>

    <main class="sub-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.sub-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: var(--max-width);
  margin: 0 auto;
  background: var(--c-surface);
}

.sub-layout__main {
  flex: 1;
  overflow-y: auto;
}
</style>
