# Tripick FE

AI 기반 여행지 추천 및 일정 관리 서비스 **Tripick**의 프론트엔드 프로젝트입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Vue 3 (Composition API) |
| 빌드 도구 | Vite |
| 상태 관리 | Pinia |
| HTTP 클라이언트 | axios |
| 라우터 | vue-router 4 |

## 연동 백엔드 서비스

| 서비스 | 포트 | 담당 |
|--------|------|------|
| Gateway | 8080 | 모든 API 요청 진입점 |
| Auth Service | 8081 | 회원가입, 로그인, JWT 토큰 |
| Festival Service | 8082 | 여행지, 축제, 북마크 |
| Recommendation Service | 8083 | AI 여행지 추천, 일정 생성 |
| Community Service | 8084 | 후기 게시글, 댓글, 좋아요 |
| Notification Service | 8085 | 알림 목록, 읽음 처리, 설정 |

## 프로젝트 구조

```
src/
├── api/              # 서비스별 axios API 모듈
│   ├── client.js     # axios 인스턴스 + JWT 인터셉터 + 토큰 갱신
│   ├── auth.js       # auth-service API
│   ├── spots.js      # festival-service 여행지 API
│   ├── festivals.js  # festival-service 축제 API
│   ├── recommendations.js
│   ├── posts.js      # community-service API
│   └── notifications.js
├── components/
│   ├── common/       # ToastMessage, BottomNav, AppHeader 등
│   └── layout/       # DefaultLayout, SubLayout
├── composables/
│   └── useToast.js   # 전역 토스트 싱글톤
├── router/
│   └── index.js      # 라우트 정의 + meta.requiresAuth 가드
├── stores/
│   ├── auth.js       # 사용자 인증 상태 (accessToken, refreshToken, user)
│   └── preferences.js # 온보딩 취향 설정
└── views/
    ├── auth/         # 로그인, 회원가입, 온보딩
    ├── home/         # 홈, 검색, 여행지 상세, 축제 상세
    ├── community/    # 커뮤니티, 후기 상세
    ├── mypage/       # 마이페이지, 즐겨찾기, 알림, 프로필
    └── schedule/     # 일정 생성, 목록, 편집, 공유
```

## 로컬 실행

```bash
npm install
npm run dev
```

기본 실행 포트: `http://localhost:5173`

백엔드 게이트웨이(`http://localhost:8080`)가 실행 중이어야 API 요청이 동작합니다.

## 환경 변수

`.env` 파일을 루트에 생성하세요 (Git에 포함되지 않음):

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 브랜치 전략

```
main          ← 최종 배포 (PR 필수, 직접 push 불가)
  └── develop ← 통합 개발 (PR 필수, 직접 push 불가)
        ├── auth-service
        ├── festival-service
        ├── recommendation-service
        ├── community-service
        ├── notification-service
        └── mypage
```

**작업 절차:**
1. 서비스 브랜치로 이동: `git checkout auth-service`
2. develop 최신 내역 반영: `git merge origin/develop`
3. 작업 후 커밋 + push
4. GitHub에서 PR 생성 → develop으로 머지
5. develop 안정화 후 PR → main 머지

## 커밋 메시지 규칙

```
type(scope): 제목
- 변경 사항 1
- 변경 사항 2
```

- **type**: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- **scope**: `auth`, `festival`, `recommendation`, `community`, `notification`, `mypage`
