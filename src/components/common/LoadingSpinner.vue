<!-- 로딩 인디케이터 — overlay: true 시 전체 화면 덮기 -->
<script setup>
defineProps({
  overlay: { type: Boolean, default: false },
  message: { type: String,  default: '' },
})
</script>

<template>
  <div class="loading" :class="{ 'loading--overlay': overlay }">
    <div class="loading__spinner" />
    <p v-if="message" class="loading__message">{{ message }}</p>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 40px;
}

.loading--overlay {
  position: fixed;
  inset: 0;
  background: rgba(235, 246, 253, 0.85);
  z-index: 150;
}

.loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loading__message {
  font-size: 14px;
  color: var(--c-text-sub);
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
