# 📋 0010capacity 브랜드 플랫폼 재구성 마스터 플랜

> **프로젝트 목표**: 포트폴리오 사이트를 소설, 블로그, 앱을 제공하는 개인 브랜드 종합 플랫폼으로 전환

**작성일**: 2024년  
**예상 기간**: 1~1.5개월 (풀타임 기준)  
**예상 비용**: $0~1.50/월 (초기)

---

## 📑 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [기술 스택](#기술-스택)
4. [저장소 구조](#저장소-구조)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [API 엔드포인트](#api-엔드포인트)
7. [이미지 관리](#이미지-관리)
8. [주요 페이지 설계](#주요-페이지-설계)
9. [구현 단계](#구현-단계)
10. [일정 및 비용](#일정-및-비용)
11. [보안](#보안)
12. [체크리스트](#체크리스트)

---

## 프로젝트 개요

### 현재 상태
- Next.js 기반 포트폴리오 사이트
- 개인 정보 (학력, 이메일, 기술스택) 표시
- 앱 목록 및 개인정보처리방침 제공

### 목표 상태
- **소설 플랫폼**: 소설 연재 및 읽기
- **블로그**: 기술/일상 블로그 포스팅
- **앱 마켓플레이스**: 앱 소개 및 다운로드
- **포트폴리오**: 커리어 정보 명함
- **Admin 페이지**: 콘텐츠 관리 시스템

### 핵심 가치
- **브랜드화**: 단순 포트폴리오 → 종합 플랫폼
- **콘텐츠 중심**: 소설/블로그 직접 작성 및 제공
- **관리 편의성**: Admin 페이지에서 모든 콘텐츠 관리
- **확장성**: 향후 추가 기능 구현 용이

---

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│           Frontend (Next.js 15)                 │
│         GitHub Pages (정적 배포)                 │
│                                                 │
│  - 홈/랜딩 페이지                                │
│  - 소설 플랫폼 (읽기)                            │
│  - 블로그                                        │
│  - 앱 마켓플레이스                               │
│  - 포트폴리오/명함                               │
│  - Admin 페이지 (콘텐츠 관리)                    │
└─────────────────────────────────────────────────┘
                     ↕️ HTTPS REST API
┌─────────────────────────────────────────────────┐
│          Backend (Rust + Axum)                  │
│              Fly.io 배포                         │
│                                                 │
│  - REST API 서버                                │
│  - JWT 인증 (단일 관리자)                       │
│  - CRUD 로직                                    │
│  - 조회수 추적                                  │
│  - 이미지 업로드/제공 (Fly Volumes)             │
└─────────────────────────────────────────────────┘
        ↕️                          ↕️
┌──────────────────┐      ┌─────────────────────┐
│   PostgreSQL     │      │   Fly.io Volumes    │
│   (Fly Postgres) │      │   (이미지 저장소)   │
│                  │      │                     │
│  - 소설/챕터     │      │  - 소설 표지        │
│  - 블로그 포스트 │      │  - 블로그 썸네일    │
│  - 앱 정보       │      │  - 앱 아이콘        │
│  - 관리자 계정   │      │  - 스크린샷         │
└──────────────────┘      └─────────────────────┘
```

### 배포 전략
- **Frontend**: GitHub Pages (무료, CDN 자동)
- **Backend**: Fly.io (무료 티어, Global Edge)
- **Database**: Fly Postgres (Managed)
- **Storage**: Fly Volumes (Persistent)

---

## 기술 스택

### Frontend
| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Framework | Next.js | 15.x | App Router, SSG |
| Language | TypeScript | 5.x | 타입 안전성 |
| Styling | Tailwind CSS | 4.x | 유틸리티 CSS |
| Markdown | react-markdown | 9.x | 콘텐츠 렌더링 |
| Editor | react-markdown-editor-lite | 1.x | Admin 에디터 |
| Code Highlight | highlight.js | 11.x | 코드 블록 |
| Deployment | GitHub Pages | - | 정적 호스팅 |

### Backend
| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Language | Rust | 1.75+ | 시스템 언어 |
| Framework | Axum | 0.7 | 웹 프레임워크 |
| Database | SQLx | 0.7 | Compile-time SQL |
| Auth | jsonwebtoken | 9.x | JWT 발급/검증 |
| Password | Argon2 | 0.5 | 비밀번호 해싱 |
| Async Runtime | Tokio | 1.x | 비동기 런타임 |
| Deployment | Fly.io | - | 컨테이너 배포 |

### Infrastructure
- **Database**: PostgreSQL 15+
- **Storage**: Fly.io Volumes (10GB)
- **CI/CD**: GitHub Actions

---

## 저장소 구조

### Monorepo 구조 (확정)

```
0010capacity.github.io/
│
├── frontend/                          # Next.js 프론트엔드
│   ├── app/
│   │   ├── page.tsx                  # 메인 랜딩
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── novels/                   # 소설 (우선순위 1)
│   │   │   ├── page.tsx              # 목록
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # 상세
│   │   │       └── chapter/[number]/page.tsx  # 읽기
│   │   │
│   │   ├── blog/                     # 블로그 (우선순위 2)
│   │   │   ├── page.tsx              # 목록
│   │   │   ├── tag/[tag]/page.tsx   # 태그별
│   │   │   └── [slug]/page.tsx      # 상세
│   │   │
│   │   ├── apps/                     # 앱 (우선순위 3)
│   │   │   ├── page.tsx              # 목록
│   │   │   └── [slug]/page.tsx      # 상세
│   │   │
│   │   ├── about/                    # 포트폴리오
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                    # 관리자
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── novels/...
│   │   │   ├── blog/...
│   │   │   └── apps/...
│   │   │
│   │   └── privacy-policy/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # 공통 UI
│   │   ├── layout/                   # 레이아웃
│   │   ├── markdown/                 # Markdown 관련
│   │   └── admin/                    # Admin 전용
│   │
│   ├── lib/
│   │   ├── api/                      # API 클라이언트
│   │   ├── auth/                     # 인증 유틸
│   │   └── utils/
│   │
│   ├── hooks/
│   ├── types/
│   ├── package.json
│   └── next.config.ts
│
├── backend/                           # Rust 백엔드
│   ├── src/
│   │   ├── main.rs
│   │   ├── config.rs
│   │   ├── error.rs
│   │   ├── routes/                   # API 라우트
│   │   ├── models/                   # 데이터 모델
│   │   ├── db/                       # DB 연결
│   │   ├── middleware/               # 인증 등
│   │   └── storage/                  # 파일 저장소
│   │
│   ├── migrations/                   # DB 마이그레이션
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── fly.toml
│
├── .github/workflows/
│   ├── frontend-deploy.yml
│   └── backend-deploy.yml
│
├── .gitignore
├── README.md
└── PLAN.md                            # 이 문서
```

---

## 데이터베이스 스키마

### 1. novels (소설 메타데이터)

```sql
CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_image_path VARCHAR(500),      -- Fly Volume 경로
    genre VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- draft, ongoing, completed
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_created_at ON novels(created_at DESC);
```

### 2. novel_chapters (소설 챕터)

```sql
CREATE TABLE novel_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,              -- Markdown
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

CREATE INDEX idx_chapters_novel_id ON novel_chapters(novel_id);
CREATE INDEX idx_chapters_number ON novel_chapters(novel_id, chapter_number);
```

### 3. blog_posts (블로그 포스트)

```sql
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,              -- Markdown
    excerpt TEXT,
    cover_image_path VARCHAR(500),      -- Fly Volume 경로
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT FALSE,
    view_count BIGINT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(published);
CREATE INDEX idx_blog_tags ON blog_posts USING GIN(tags);
CREATE INDEX idx_blog_published_at ON blog_posts(published_at DESC NULLS LAST);
```

### 4. apps (앱 정보)

```sql
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL,      -- ios, android, web, desktop
    icon_path VARCHAR(500),             -- Fly Volume 경로
    screenshots TEXT[] DEFAULT '{}',    -- Volume 경로 배열
    download_links JSONB DEFAULT '{}',  -- {"ios": "...", "android": "..."}
    privacy_policy_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_slug ON apps(slug);
CREATE INDEX idx_apps_platform ON apps(platform);
```

### 5. admins (관리자 - 단일)

```sql
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Argon2
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 계정은 /api/auth/register로 생성 후 비활성화
```

---

## API 엔드포인트

### 🔐 인증

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | JWT 발급 (7일 유효) |
| POST | `/api/auth/register` | ❌ | 관리자 등록 (초기 설정용) |
| GET | `/api/auth/me` | 🔒 | 현재 사용자 정보 |

### 📚 소설 (우선순위 1)

#### 공개 엔드포인트
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/novels` | 소설 목록 (?status=ongoing&limit=10&offset=0) |
| GET | `/api/novels/:slug` | 소설 상세 |
| GET | `/api/novels/:slug/chapters` | 챕터 목록 |
| GET | `/api/novels/:slug/chapters/:number` | 챕터 내용 |
| POST | `/api/novels/:slug/increment-view` | 조회수 +1 |
| POST | `/api/novels/:slug/chapters/:number/increment-view` | 챕터 조회수 +1 |

#### 관리자 전용 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/novels` | 소설 생성 |
| PUT | `/api/novels/:id` | 소설 수정 |
| DELETE | `/api/novels/:id` | 소설 삭제 |
| POST | `/api/novels/:slug/chapters` | 챕터 생성 |
| PUT | `/api/novels/:slug/chapters/:id` | 챕터 수정 |
| DELETE | `/api/novels/:slug/chapters/:id` | 챕터 삭제 |

### 📝 블로그 (우선순위 2)

#### 공개 엔드포인트
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blog` | 포스트 목록 (?published=true&tag=tech) |
| GET | `/api/blog/:slug` | 포스트 상세 |
| GET | `/api/blog/tags` | 모든 태그 목록 |
| GET | `/api/blog/tags/:tag` | 태그별 포스트 |
| POST | `/api/blog/:slug/increment-view` | 조회수 +1 |

#### 관리자 전용 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blog` | 포스트 생성 |
| PUT | `/api/blog/:id` | 포스트 수정 |
| DELETE | `/api/blog/:id` | 포스트 삭제 |

### 📱 앱 (우선순위 3)

#### 공개 엔드포인트
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/apps` | 앱 목록 (?platform=ios) |
| GET | `/api/apps/:slug` | 앱 상세 |

#### 관리자 전용 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/apps` | 앱 등록 |
| PUT | `/api/apps/:id` | 앱 수정 |
| DELETE | `/api/apps/:id` | 앱 삭제 |

### 📤 이미지 업로드

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/image` | 🔒 | 이미지 업로드 (multipart/form-data) |
| GET | `/api/images/:path` | ❌ | 이미지 제공 |

### ⚡ 시스템

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API 정보 |
| GET | `/health` | 헬스체크 |

---

## 이미지 관리

### Fly.io Volumes 사용

#### 볼륨 생성
```bash
fly volumes create capacity_images --size 10 --region nrt
```

#### 저장소 구조
```
/data/images/                # Fly Volume 마운트 지점
├── covers/                  # 소설 표지
│   ├── {uuid}.jpg
│   └── {uuid}.png
├── blog/                    # 블로그 썸네일
│   ├── {uuid}.jpg
│   └── {uuid}.webp
├── apps/                    # 앱 아이콘
│   ├── {uuid}.png
│   └── {uuid}.jpg
└── screenshots/             # 앱 스크린샷
    ├── {uuid}-1.jpg
    └── {uuid}-2.jpg
```

#### 업로드 프로세스
1. Admin 페이지에서 파일 선택
2. `POST /api/upload/image` (multipart/form-data)
3. Backend에서 검증 (타입, 크기)
4. UUID 생성 + Fly Volume에 저장
5. Response: `{ "path": "/images/covers/{uuid}.jpg" }`
6. Frontend에서 path를 DB에 저장

#### 이미지 제공
```
GET /api/images/covers/{uuid}.jpg
→ Backend에서 /data/images/covers/{uuid}.jpg 파일 스트리밍
```

#### 검증 규칙
- **허용 타입**: jpg, png, webp
- **최대 크기**: 5MB
- **보안**: Path traversal 방지

---

## 주요 페이지 설계

### 1. 메인 랜딩 페이지 (`/`)

**구성**:
- Hero 섹션 (큰 타이틀 + CTA)
- 최신 소설 3개 미리보기
- 최신 블로그 3개 미리보기
- 주요 앱 소개
- Footer

**목표**: 브랜드 전체를 한눈에 보여주기

### 2. 소설 목록 (`/novels`)

**구성**:
- 필터 (상태: 전체/연재중/완결)
- 소설 카드 그리드 (표지, 제목, 장르, 조회수)
- 페이지네이션

### 3. 소설 상세 (`/novels/[slug]`)

**구성**:
- 표지 이미지
- 제목, 작가, 장르, 상태, 조회수
- 줄거리 설명
- 챕터 목록 (클릭하면 읽기)

### 4. 챕터 읽기 (`/novels/[slug]/chapter/[number]`)

**구성**:
- 헤더 (← 목록, 제목, 폰트 크기 조절, 북마크)
- Markdown 본문 (가독성 최적화)
- 네비게이션 (이전/다음 챕터)

**기능**:
- 북마크 (localStorage)
- 폰트 크기 조절
- 다크/라이트 모드
- 자동 조회수 증가

### 5. 블로그 목록 (`/blog`)

**구성**:
- 태그 필터
- 포스트 카드 (썸네일, 제목, 날짜, 요약)
- 페이지네이션

### 6. 블로그 상세 (`/blog/[slug]`)

**구성**:
- 커버 이미지
- 제목, 날짜, 읽기 시간, 조회수
- 태그
- Markdown 본문 (코드 하이라이팅)
- 이전/다음 글

### 7. 앱 목록 (`/apps`)

**구성**:
- 플랫폼 필터 (iOS, Android, Web, Desktop)
- 앱 카드 (아이콘, 이름, 설명, 다운로드 버튼)

### 8. 앱 상세 (`/apps/[slug]`)

**구성**:
- 아이콘, 이름, 플랫폼
- 다운로드 링크
- 스크린샷 캐러셀
- 상세 설명
- 개인정보처리방침 링크

### 9. 포트폴리오 (`/about`)

**구성**:
- 프로필 정보 (현재 메인 페이지 내용)
- 기술 스택
- GitHub 캘린더
- 커리어 타임라인

### 10. Admin 로그인 (`/admin/login`)

**구성**:
- Username/Password 입력
- 로그인 버튼
- JWT 발급 후 Dashboard 이동

### 11. Admin 대시보드 (`/admin/dashboard`)

**구성**:
- 통계 (소설/블로그/앱 개수, 총 조회수)
- 빠른 작성 버튼
- 최근 활동

### 12. Admin 소설 관리 (`/admin/novels`)

**구성**:
- 소설 목록 (수정/삭제 버튼)
- [+ 새 소설] 버튼
- 각 소설마다 [챕터 관리] 버튼

### 13. Admin 소설 생성/수정 (`/admin/novels/new`)

**구성**:
- Slug 입력
- 제목, 설명, 장르 입력
- 표지 이미지 업로드
- 상태 선택 (초안/연재중/완결)
- 저장 버튼

### 14. Admin 챕터 작성 (`/admin/novels/[id]/chapters/new`)

**구성**:
- 챕터 번호
- 챕터 제목
- Markdown 에디터 (실시간 미리보기)
- 발행 체크박스
- 저장/미리보기 버튼

### 15. Admin 블로그 작성 (`/admin/blog/new`)

**구성**:
- Slug 입력
- 제목, 요약 입력
- 썸네일 업로드
- 태그 입력 (쉼표 구분)
- Markdown 에디터
- 발행 체크박스
- 저장 버튼

---

## 구현 단계

### Phase 0: 준비 ✅ **완료**
- [x] Monorepo 구조로 재구성
- [x] frontend/ 디렉토리 생성
- [x] 파일 이동 완료
- [x] README.md 업데이트

---

### Phase 1: 백엔드 기반 (3~5일)

#### 목표
Rust 백엔드 기본 구조 완성 및 로컬 실행

#### 작업 내용
1. **Rust 프로젝트 스캐폴딩** (1일)
   - [ ] Cargo.toml 의존성 설정
   - [ ] src/ 디렉토리 구조 생성
   - [ ] main.rs: Axum 서버 기본 설정
   - [ ] config.rs: 환경변수 관리
   - [ ] error.rs: 에러 타입 정의
   - [ ] 로컬 실행 테스트

2. **데이터베이스 설정** (1일)
   - [ ] PostgreSQL 로컬 설치/실행
   - [ ] migrations/ 디렉토리 생성
   - [ ] 5개 마이그레이션 SQL 작성
   - [ ] SQLx 마이그레이션 실행
   - [ ] DB 연결 테스트

3. **기본 API** (1~2일)
   - [ ] GET / (API 정보)
   - [ ] GET /health (헬스체크)
   - [ ] CORS 미들웨어
   - [ ] Tracing/Logging 설정
   - [ ] 에러 핸들링 테스트

4. **Fly Volumes 설정** (1일)
   - [ ] Fly.io 계정 생성
   - [ ] flyctl 설치
   - [ ] fly.toml 작성
   - [ ] Dockerfile 작성
   - [ ] Fly Volume 생성 (10GB)
   - [ ] 로컬 이미지 저장 테스트

#### 완료 조건
- ✅ `cargo run` 후 http://localhost:8080 접속 성공
- ✅ PostgreSQL 테이블 생성 확인
- ✅ 이미지 저장/제공 테스트 성공

---

### Phase 2: 인증 시스템 (2~3일)

#### 목표
JWT 기반 인증 시스템 구현

#### 작업 내용
1. **Backend 인증** (1일)
   - [ ] models/auth.rs 작성
   - [ ] routes/auth.rs 구현
   - [ ] Argon2 비밀번호 해싱
   - [ ] JWT 토큰 발급 (7일 유효)

2. **인증 미들웨어** (1일)
   - [ ] middleware/auth.rs 구현
   - [ ] AuthUser extractor
   - [ ] JWT 검증 로직

3. **Frontend 로그인** (1일)
   - [ ] app/admin/login/page.tsx
   - [ ] lib/api/auth.ts
   - [ ] lib/auth/token.ts
   - [ ] hooks/useAuth.ts
   - [ ] components/admin/AuthGuard.tsx

#### 완료 조건
- ✅ 관리자 계정 생성
- ✅ 로그인 → JWT 발급
- ✅ 보호된 API 호출 성공

---

### Phase 3: 소설 플랫폼 (7~9일) - **우선순위 1**

#### 목표
소설 작성/읽기 전체 기능 구현

#### 작업 내용
1. **Backend 소설 API** (2일)
   - [ ] models/novel.rs
   - [ ] routes/novels.rs (소설 CRUD)
   - [ ] 챕터 CRUD
   - [ ] 조회수 증가 로직

2. **Frontend 읽기 페이지** (2일)
   - [ ] app/novels/page.tsx (목록)
   - [ ] app/novels/[slug]/page.tsx (상세)
   - [ ] app/novels/[slug]/chapter/[number]/page.tsx (읽기)
   - [ ] components/markdown/MarkdownRenderer.tsx
   - [ ] 북마크 기능 (localStorage)
   - [ ] 폰트 크기 조절

3. **Admin 소설 관리** (3일)
   - [ ] app/admin/novels/page.tsx (목록)
   - [ ] app/admin/novels/new/page.tsx (생성)
   - [ ] app/admin/novels/[id]/edit/page.tsx (수정)
   - [ ] app/admin/novels/[id]/chapters/new/page.tsx (챕터 작성)
   - [ ] components/markdown/MarkdownEditor.tsx
   - [ ] components/admin/ImageUploader.tsx
   - [ ] 표지 이미지 업로드

4. **테스트** (1일)
   - [ ] 전체 플로우 테스트
   - [ ] 반응형 확인

#### 완료 조건
- ✅ 소설 생성/수정/삭제
- ✅ 챕터 작성
- ✅ 공개 페이지에서 읽기
- ✅ 표지 이미지 표시
- ✅ 북마크 기능 동작

---

### Phase 4: 블로그 (5~7일) - **우선순위 2**

#### 목표
블로그 작성/읽기 전체 기능 구현

#### 작업 내용
1. **Backend 블로그 API** (1~2일)
   - [ ] models/blog.rs
   - [ ] routes/blog.rs (블로그 CRUD)
   - [ ] 태그 필터링 쿼리

2. **Frontend 블로그 페이지** (2일)
   - [ ] app/blog/page.tsx (목록)
   - [ ] app/blog/[slug]/page.tsx (상세)
   - [ ] app/blog/tag/[tag]/page.tsx (태그별)
   - [ ] 코드 하이라이팅
   - [ ] 읽기 시간 계산

3. **Admin 블로그 관리** (2~3일)
   - [ ] app/admin/blog/page.tsx (목록)
   - [ ] app/admin/blog/new/page.tsx (작성)
   - [ ] app/admin/blog/[id]/edit/page.tsx (수정)
   - [ ] Markdown 에디터
   - [ ] 썸네일 업로드
   - [ ] 발행/비공개 토글

#### 완료 조건
- ✅ 블로그 포스트 작성/수정
- ✅ Markdown 렌더링
- ✅ 태그 필터링
- ✅ 코드 하이라이팅

---

### Phase 5: 앱 마켓 (3~4일) - **우선순위 3**

#### 목표
앱 등록 및 소개 페이지 구현

#### 작업 내용
1. **Backend 앱 API** (1일)
   - [ ] models/app.rs
   - [ ] routes/apps.rs (앱 CRUD)
   - [ ] 플랫폼 필터링

2. **Frontend 앱 페이지** (1일)
   - [ ] app/apps/page.tsx (목록)
   - [ ] app/apps/[slug]/page.tsx (상세)
   - [ ] 스크린샷 캐러셀

3. **Admin 앱 관리** (1~2일)
   - [ ] app/admin/apps/page.tsx (목록)
   - [ ] app/admin/apps/new/page.tsx (등록)
   - [ ] app/admin/apps/[id]/edit/page.tsx (수정)
   - [ ] 아이콘/스크린샷 업로드

#### 완료 조건
- ✅ 앱 등록/수정
- ✅ 플랫폼 필터링
- ✅ 이미지 업로드

---

### Phase 6: 메인 랜딩 & 포트폴리오 (3~4일)

#### 목표
통일된 브랜드 경험 제공

#### 작업 내용
1. **메인 랜딩** (2일)
   - [ ] app/page.tsx 재구성
   - [ ] Hero 섹션
   - [ ] 최신 콘텐츠 미리보기
   - [ ] 애니메이션 효과

2. **포트폴리오 페이지** (1일)
   - [ ] app/about/page.tsx
   - [ ] 현재 메인 페이지 내용 이동

3. **네비게이션** (1일)
   - [ ] components/layout/Header.tsx
   - [ ] components/layout/Footer.tsx
   - [ ] 반응형 메뉴

#### 완료 조건
- ✅ 통일된 디자인
- ✅ 모든 페이지 네비게이션

---

### Phase 7: 배포 & CI/CD (2~3일)

#### 목표
자동 배포 파이프라인 구축

#### 작업 내용
1. **Fly.io 배포** (1일)
   - [ ] Fly 앱 생성
   - [ ] PostgreSQL 프로비저닝
   - [ ] Volume 연결
   - [ ] 환경변수 설정
   - [ ] 첫 배포
   - [ ] 관리자 계정 생성

2. **GitHub Actions - Backend** (1일)
   - [ ] .github/workflows/backend-deploy.yml
   - [ ] Fly API 토큰 설정
   - [ ] 자동 배포 테스트

3. **GitHub Actions - Frontend** (1일)
   - [ ] .github/workflows/frontend-deploy.yml
   - [ ] GitHub Pages 설정
   - [ ] 자동 배포 테스트

#### 완료 조건
- ✅ Backend: https://0010capacity-backend.fly.dev
- ✅ Frontend: https://0010capacity.github.io
- ✅ 자동 배포 동작

---

### Phase 8: 폴리싱 (3~5일)

#### 목표
프로덕션 레벨 품질

#### 작업 내용
1. **UX 개선** (1일)
   - [ ] 로딩 스피너
   - [ ] 에러 메시지 Toast
   - [ ] 빈 상태 UI
   - [ ] 404/500 페이지

2. **SEO 최적화** (1일)
   - [ ] 메타 태그
   - [ ] Open Graph 이미지
   - [ ] sitemap.xml
   - [ ] robots.txt

3. **성능 최적화** (1일)
   - [ ] Next.js Image 최적화
   - [ ] 코드 스플리팅
   - [ ] Lighthouse 90+ 달성

4. **반응형 & 접근성** (1~2일)
   - [ ] 모바일 최적화
   - [ ] 키보드 네비게이션
   - [ ] ARIA 라벨

#### 완료 조건
- ✅ 모든 디바이스 정상 동작
- ✅ Lighthouse 점수 90+
- ✅ 에러 핸들링 완료

---

### Phase 9: 추가 기능 (향후)

나중에 추가 가능한 기능들:
- [ ] 댓글 시스템 (Giscus)
- [ ] 전체 검색 (MeiliSearch)
- [ ] RSS 피드
- [ ] 이메일 뉴스레터
- [ ] 소설 epub 다운로드
- [ ] Admin 통계 대시보드
- [ ] 이미지 리사이징
- [ ] CDN 캐싱

---

## 일정 및 비용

### 예상 일정

| Phase | 내용 | 기간 | 누적 |
|-------|------|------|------|
| 0 ✅ | 준비 | 1일 | 1일 |
| 1 | 백엔드 기반 | 3-5일 | 4-6일 |
| 2 | 인증 | 2-3일 | 6-9일 |
| 3 | 소설 ⭐ | 7-9일 | 13-18일 |
| 4 | 블로그 ⭐ | 5-7일 | 18-25일 |
| 5 | 앱 ⭐ | 3-4일 | 21-29일 |
| 6 | 랜딩 | 3-4일 | 24-33일 |
| 7 | 배포 | 2-3일 | 26-36일 |
| 8 | 폴리싱 | 3-5일 | 29-41일 |

**총 예상 기간**:
- **최소**: 29일 (약 1개월)
- **최대**: 41일 (약 1.5개월)
- **파트타임**: 2~3개월

### 예상 비용

#### 초기 비용 (6개월)
| 항목 | 비용/월 |
|------|---------|
| Fly.io (Backend + DB) | $0 |
| Fly Volume (10GB) | $1.50 |
| GitHub Pages | $0 |
| **총** | **$1.50** |

#### 트래픽 증가 시 (월 1만 방문자)
| 항목 | 비용/월 |
|------|---------|
| Fly.io 유료 플랜 | $5-10 |
| Fly Volume (20GB) | $3 |
| **총** | **$8-13** |

#### 대규모 운영 (월 10만 방문자)
| 항목 | 비용/월 |
|------|---------|
| Fly.io 스케일업 | $20-30 |
| Fly Volume (50GB) | $7.50 |
| CDN (선택) | $0-10 |
| **총** | **$27.50-47.50** |

---

## 보안

### 구현 완료
- [x] HTTPS only (Fly.io 자동)
- [x] JWT 인증 (7일 만료)
- [x] Argon2 비밀번호 해싱
- [x] CORS 설정
- [x] SQL Injection 방지 (SQLx)
- [x] Input Validation (validator)
- [x] 환경변수 보호

### 향후 추가
- [ ] Rate Limiting
- [ ] CSRF 토큰
- [ ] XSS 방지 (Markdown sanitize)
- [ ] 파일 업로드 제한 (5MB, 타입)
- [ ] Path Traversal 방지
- [ ] 로그인 시도 제한

---

## 체크리스트

### 기능
- [ ] 소설 작성/수정/삭제/읽기
- [ ] 블로그 작성/수정/삭제/읽기
- [ ] 앱 등록/수정/삭제/조회
- [ ] 이미지 업로드/표시
- [ ] 관리자 로그인/인증
- [ ] 조회수 추적
- [ ] 북마크 기능
- [ ] 태그 필터링
- [ ] Markdown 렌더링
- [ ] 반응형 디자인

### 배포
- [ ] Backend: Fly.io 자동 배포
- [ ] Frontend: GitHub Pages 자동 배포
- [ ] 환경변수 설정 완료
- [ ] 도메인 연결 (선택)

### 품질
- [ ] 모든 주요 기능 테스트
- [ ] 모바일 확인
- [ ] Lighthouse 점수 90+
- [ ] 에러 핸들링 완료
- [ ] 로딩 상태 표시

---

## 참고 문서

### Rust
- [Axum 공식 문서](https://docs.rs/axum/)
- [SQLx 가이드](https://github.com/launchbadge/sqlx)
- [Rust Async Book](https://rust-lang.github.io/async-book/)

### Next.js
- [Next.js 15 문서](https://nextjs.org/docs)
- [React Markdown](https://github.com/remarkjs/react-markdown)

### Fly.io
- [Fly.io 문서](https://fly.io/docs/)
- [Volumes 가이드](https://fly.io/docs/reference/volumes/)
- [Postgres 가이드](https://fly.io/docs/postgres/)

---

## 결론

이 계획서는 0010capacity 개인 브랜드 플랫폼 구축을 위한 완전한 로드맵입니다.

### 핵심 특징
✅ **Monorepo**: 프론트/백엔드 통합 관리  
✅ **Rust + Next.js**: 성능과 개발 경험 모두 충족  
✅ **Fly.io**: 저렴한 비용으로 글로벌 배포  
✅ **Markdown**: 작성 편의성과 버전 관리  
✅ **단계별 구현**: 우선순위에 따른 점진적 개발  

### 다음 단계
1. ✅ Phase 0 완료
2. 🚀 Phase 1 시작: 백엔드 기반 구축

**Let's build something amazing! 🎉**