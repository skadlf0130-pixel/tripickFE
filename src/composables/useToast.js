// ToastMessage 컴포넌트를 어디서든 호출할 수 있는 composable
// 사용법: const toast = useToast(); toast.success('저장되었습니다')
// provideToast(ref) 에서 ref = App.vue의 template ref (Ref<ComponentInstance>)
// .value 로 접근해야 실제 컴포넌트 인스턴스를 얻을 수 있음

let _appRef = null

export function provideToast(ref) {
  _appRef = ref
}

export function useToast() {
  return {
    info:    (msg) => _appRef?.value?.show(msg, 'info'),
    success: (msg) => _appRef?.value?.show(msg, 'success'),
    error:   (msg) => _appRef?.value?.show(msg, 'error'),
  }
}
