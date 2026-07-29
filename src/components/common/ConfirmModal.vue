<!-- 확인/취소 모달 — 삭제, 로그아웃 등 재확인이 필요한 경우 사용 -->
<script setup>
defineProps({
  visible:     { type: Boolean, required: true },
  title:       { type: String,  default: '확인' },
  message:     { type: String,  default: '' },
  confirmText: { type: String,  default: '확인' },
  cancelText:  { type: String,  default: '취소' },
  danger:      { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="backdrop" @click.self="emit('cancel')">
      <div class="modal">
        <p class="modal__title">{{ title }}</p>
        <p v-if="message" class="modal__message">{{ message }}</p>
        <div class="modal__actions">
          <button class="btn btn--cancel" @click="emit('cancel')">{{ cancelText }}</button>
          <button class="btn btn--confirm" :class="{ 'btn--danger': danger }" @click="emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(31, 45, 44, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--c-surface);
  border-radius: var(--r-card);
  padding: 24px 20px 16px;
  width: 288px;
  text-align: center;
}

.modal__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 8px;
}

.modal__message {
  font-size: 14px;
  color: var(--c-text-sub);
  margin: 0 0 20px;
  line-height: 1.6;
}

.modal__actions {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: var(--r-btn);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.btn--cancel {
  background: var(--c-tag-gray);
  color: var(--c-text);
}

.btn--confirm {
  background: var(--c-primary);
  color: #fff;
}

.btn--danger {
  background: var(--c-error);
}
</style>
