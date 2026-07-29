<!-- 앱 루트: ToastMessage를 전역 등록 -->
<script setup>
import { ref } from 'vue'
import ToastMessage from './components/common/ToastMessage.vue'
import { provideToast } from './composables/useToast'

const toastRef = ref(null)
provideToast(toastRef)
</script>

<template>
  <RouterView />
  <ToastMessage ref="toastRef" />
</template>
