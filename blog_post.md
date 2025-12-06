# Next.js + Rust로 만드는 나만의 종합 콘텐츠 플랫폼

## 들어가며

개인 브랜드를 구축하고 싶었다. 소설도 쓰고, 기술 블로그도 운영하고, 만든 앱도 소개하는 하나의 통합된 플랫폼이 필요했다. 기존의 여러 서비스를 사용할 수도 있었지만, 직접 만들기로 결심했다. 그렇게 시작된 **0010capacity** 플랫폼 개발 이야기를 공유한다.

## 프로젝트 개요

### 무엇을 만들었나

3가지 핵심 기능을 가진 웹 플랫폼이다:

1. **소설 플랫폼** - 연재 소설을 챕터별로 관리하고 독자에게 제공한다
2. **기술 블로그** - 개발 경험과 지식을 공유하는 블로그이다
3. **앱 마켓플레이스** - 제가 만든 앱들을 소개하고 배포하는 공간이다

각 기능은 독립적으로 동작하지만, 하나의 통합된 브랜드 경험을 제공한다.

## 기술 스택 선택

### Frontend: Next.js 15

처음에는 단순한 정적 사이트를 고려했지만, 동적 콘텐츠 관리와 SEO를 고려해 **Next.js 15**를 선택했다.

```typescript
// App Router 기반 구조
app/
├── page.tsx              // 메인 랜딩
├── novels/
│   ├── page.tsx         // 소설 목록
│   └── [slug]/
│       ├── page.tsx     // 소설 상세
│       └── chapter/[number]/
│           └── page.tsx // 챕터 읽기
├── blog/
│   ├── page.tsx         // 블로그 목록
│   └── [slug]/
│       └── page.tsx     // 포스트 상세
└── admin/
    ├── login/
    └── dashboard/
```

**선택 이유:**
- App Router의 직관적인 파일 기반 라우팅
- Server Components로 초기 로딩 성능 향상
- TypeScript 지원으로 안정적인 코드베이스 구축
- GitHub Pages에 정적 배포 가능

### Backend: Rust + Axum

가장 고민이 많았던 부분이다. Node.js나 Python이 더 빠르게 개발할 수 있었겠지만, **Rust**를 선택했다.

```rust
// Axum을 사용한 간결한 라우팅
let app = Router::new()
    .route("/", get(root))
    .route("/health", get(health_check))
    .nest("/api/novels", novels_routes())
    .nest("/api/blog", blog_routes())
    .nest("/api/apps", apps_routes())
    .layer(cors_layer)
    .layer(TraceLayer::new_for_http());
```

**선택 이유:**
- 메모리 안전성과 높은 성능을 보장한다
- 타입 시스템으로 런타임 에러를 최소화한다
- Axum의 ergonomic한 API 설계가 돋보인다
- 낮은 운영 비용으로 Fly.io 무료 티어로도 충분하다

### Database: PostgreSQL

관계형 데이터베이스의 장점을 활용하고 싶었다.

```sql
-- 소설과 챕터의 관계
CREATE TABLE novels (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image VARCHAR(512),
    status VARCHAR(50) DEFAULT 'draft',
    views INTEGER DEFAULT 0
);

CREATE TABLE novel_chapters (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    UNIQUE(novel_id, chapter_number)
);
```

**선택 이유:**
- 트랜잭션 보장으로 데이터 일관성을 유지한다
- 복잡한 쿼리와 JOIN을 지원한다
- SQLx로 컴파일 타임 쿼리 검증이 가능하다
- Fly.io에서 무료 PostgreSQL을 제공한다

## 아키텍처 설계

### Monorepo 구조

처음부터 Frontend와 Backend를 분리된 저장소로 관리하는 것보다, 하나의 Monorepo로 관리하기로 했다.

```
0010capacity.github.io/
├── frontend/          # Next.js (GitHub Pages)
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/           # Rust + Axum (Fly.io)
│   ├── src/
│   ├── migrations/
│   └── Cargo.toml
└── .github/
    └── workflows/     # CI/CD
```

**장점:**
- 타입 정의를 공유할 수 있다
- 버전 관리가 단순하다
- 모든 문서가 한곳에 모인다
- CI/CD 파이프라인을 통합 관리할 수 있다

### 배포 전략

두 가지 서비스를 서로 다른 플랫폼에 배포했다:

- **Frontend**: GitHub Pages (무료, 정적 호스팅)
- **Backend**: Fly.io (무료 티어, 컨테이너 배포)

```yaml
# GitHub Actions 워크플로우
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'  # Frontend 변경 시
      - 'backend/**'   # Backend 변경 시

jobs:
  deploy-frontend:
    # Next.js 빌드 및 GitHub Pages 배포
  
  deploy-backend:
    # Docker 이미지 빌드 및 Fly.io 배포
```

## 핵심 기능 구현

### 1. 소설 플랫폼

가장 공들인 부분이다. 챕터별 관리와 독자 경험을 중심으로 설계했다.

**주요 기능:**
- 소설 메타데이터 관리 (제목, 설명, 장르, 표지)
- 챕터별 콘텐츠 관리
- 상태 관리 (임시저장, 연재중, 완료)
- 조회수 추적
- 이전/다음 챕터 네비게이션

```typescript
// 챕터 읽기 페이지
export default async function ChapterPage({ params }) {
  const novel = await novelsApi.getBySlug(params.slug);
  const chapter = await novelsApi.getChapter(params.slug, params.number);
  const chapters = await novelsApi.getChapters(params.slug);

  return (
    <div className="max-w-4xl mx-auto">
      <ChapterNavigation 
        prev={chapter.chapter_number > 1 ? chapter.chapter_number - 1 : null}
        next={chapter.chapter_number < chapters.length ? chapter.chapter_number + 1 : null}
      />
      <article className="prose prose-invert">
        {chapter.content}
      </article>
    </div>
  );
}
```

### 2. 인증 시스템

관리자만 콘텐츠를 작성할 수 있도록 JWT 기반 인증을 구현했다.

```rust
// JWT 토큰 생성
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>> {
    let admin = sqlx::query_as::<_, Admin>(
        "SELECT * FROM admins WHERE username = $1"
    )
    .bind(&payload.username)
    .fetch_one(&state.db)
    .await?;

    // Argon2로 비밀번호 검증
    verify_password(&payload.password, &admin.password_hash)?;

    // JWT 토큰 발급
    let token = create_jwt(&admin.username)?;
    
    Ok(Json(LoginResponse { token }))
}
```

**보안 고려사항:**
- Argon2로 비밀번호 해싱을 처리한다
- JWT 토큰에 만료 시간을 설정한다
- HTTPS를 강제한다 (프로덕션)
- CORS 정책을 적절히 설정한다

### 3. API 클라이언트 설계

Frontend에서 Backend API를 쉽게 사용할 수 있도록 타입 안전한 클라이언트를 만들었다.

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const novelsApi = {
  list: async (): Promise<Novel[]> => {
    const res = await fetch(`${API_BASE}/api/novels`);
    if (!res.ok) throw new Error('Failed to fetch novels');
    return res.json();
  },

  getBySlug: async (slug: string): Promise<Novel> => {
    const res = await fetch(`${API_BASE}/api/novels/${slug}`);
    if (!res.ok) throw new Error('Novel not found');
    return res.json();
  },

  create: async (data: NovelCreate, token: string): Promise<Novel> => {
    const res = await fetch(`${API_BASE}/api/novels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create novel');
    return res.json();
  },
};
```

## 개발 과정에서 배운 점

### 1. Rust의 러닝 커브

처음에는 소유권(Ownership) 개념이 어려웠다. 특히 비동기 프로그래밍에서 문제가 많았다.

```rust
// 처음 작성한 코드 (컴파일 에러)
let novel = get_novel_from_db().await?;
let chapters = get_chapters(&novel).await?; // novel이 이동됨
println!("{}", novel.title); // 에러!

// 수정한 코드
let novel = get_novel_from_db().await?;
let chapters = get_chapters(&novel).await?; // 참조로 전달
println!("{}", novel.title); // OK!
```

하지만 이 과정에서 메모리 안전성에 대해 깊이 이해하게 되었다.

### 2. Next.js App Router의 패러다임

Server Components와 Client Components의 구분이 처음에는 혼란스러웠다.

```typescript
// Server Component에서 useState 사용 불가
export default function Page() {
  const [count, setCount] = useState(0); // 에러!
  return <div>{count}</div>;
}

// 'use client' 디렉티브 추가 필요
'use client';
export default function Page() {
  const [count, setCount] = useState(0); // OK!
  return <div>{count}</div>;
}
```

하지만 이를 제대로 활용하면 초기 로딩 성능이 크게 향상된다.

### 3. 데이터베이스 설계의 중요성

초기에는 간단한 구조로 시작했지만, 나중에 기능을 추가하면서 마이그레이션이 필요했다.

**교훈:**
- 처음부터 확장 가능한 스키마를 설계해야 한다
- Foreign Key 제약 조건을 적극 활용해야 한다
- Index를 통한 쿼리 최적화가 필수다
- 마이그레이션 스크립트를 버전 관리해야 한다

### 4. CI/CD의 가치

수동 배포에서 자동 배포로 전환하면서 개발 속도가 크게 향상되었다.

```yaml
# GitHub Actions로 자동 배포
- name: Deploy Frontend
  if: contains(github.event.head_commit.modified, 'frontend/')
  run: |
    cd frontend
    npm run export
    # GitHub Pages로 배포

- name: Deploy Backend
  if: contains(github.event.head_commit.modified, 'backend/')
  run: |
    cd backend
    flyctl deploy --remote-only
```

## 성능 최적화

### Frontend

1. **정적 생성 활용**
   - 소설 목록, 블로그 포스트는 빌드 시 생성한다
   - Incremental Static Regeneration으로 업데이트한다

2. **이미지 최적화**
   - Next.js Image 컴포넌트를 사용한다
   - WebP 포맷으로 자동 변환한다
   - Lazy loading을 적용한다

3. **번들 크기 최적화**
   - Dynamic Import로 코드 스플리팅을 수행한다
   - 불필요한 라이브러리를 제거한다

### Backend

1. **데이터베이스 쿼리 최적화**
   ```rust
   // N+1 문제 해결
   // 각 소설마다 챕터 개수를 조회하는 방식은 비효율적
   for novel in novels {
       let count = get_chapter_count(novel.id).await?;
   }
   
   // JOIN으로 한 번에 조회하는 방식으로 개선
   let novels_with_count = sqlx::query!(
       "SELECT n.*, COUNT(c.id) as chapter_count
        FROM novels n
        LEFT JOIN novel_chapters c ON n.id = c.novel_id
        GROUP BY n.id"
   ).fetch_all(&pool).await?;
   ```

2. **연결 풀 관리**
   - SQLx의 PgPool로 효율적인 커넥션 관리를 수행한다
   - 적절한 min/max connections를 설정한다

3. **캐싱 전략**
   - 자주 조회되는 데이터는 메모리 캐시를 활용한다
   - ETags를 활용한 브라우저 캐싱을 구현한다

## 비용 분석

현재 무료 티어로 운영 중이다:

| 서비스 | 플랜 | 비용 | 제한사항 |
|--------|------|------|---------|
| GitHub Pages | 무료 | $0 | 1GB 저장소, 월 100GB 대역폭 |
| Fly.io | 무료 티어 | $0 | 3개 shared-cpu-1x 인스턴스 |
| PostgreSQL | Fly.io 무료 | $0 | 3GB 저장공간 |
| **총 비용** | - | **$0/월** | - |

**트래픽 증가 시 예상 비용:**
- 월 1만 방문자: 약 $5/월
- 월 10만 방문자: 약 $25/월

개인 프로젝트로는 충분히 감당 가능한 수준이다.

## 앞으로의 계획

### Phase 2: 이미지 업로드 및 관리

현재는 이미지 URL을 직접 입력하지만, 파일 업로드 기능을 추가할 예정이다.

```rust
// 예정된 이미지 업로드 API
POST /api/upload/image
Content-Type: multipart/form-data

// Fly Volumes에 저장
// 카테고리별 폴더 구조
/data/images/
├── novels/
├── blog/
└── apps/
```

### Phase 3: 고급 기능

- 전체 텍스트 검색 (PostgreSQL Full-Text Search)
- 북마크 및 찜하기 기능
- 댓글 시스템
- RSS 피드 생성
- 다크/라이트 모드 토글
- PWA 지원

### Phase 4: 분석 및 모니터링

- Google Analytics 통합
- 에러 트래킹 (Sentry)
- 성능 모니터링
- 사용자 행동 분석

## 결론

### 프로젝트를 통해 얻은 것

1. **기술적 성장**
   - Rust에 대한 깊은 이해를 얻었다
   - Next.js 15의 최신 기능을 활용할 수 있게 되었다
   - 전체 스택 개발 경험을 쌓았다

2. **아키텍처 설계 능력**
   - 확장 가능한 시스템을 설계할 수 있게 되었다
   - 마이크로서비스 간 통신을 구현했다
   - 데이터베이스 스키마 설계 능력이 향상되었다

3. **DevOps 경험**
   - CI/CD 파이프라인을 구축했다
   - 컨테이너화 (Docker)를 경험했다
   - 클라우드 배포 (Fly.io)를 실습했다

### 이런 분들께 추천한다

- 개인 브랜드를 구축하고 싶은 개발자
- 최신 웹 기술을 학습하고 싶은 분
- 포트폴리오 프로젝트가 필요한 분
- 무료 또는 저비용으로 서비스를 운영하고 싶은 분

### 마치며

처음에는 간단한 포트폴리오 사이트를 만들려고 했지만, 지금은 제대로 된 플랫폼이 되었다. 완벽하지는 않지만, 계속 개선해 나갈 것이다.

코드는 GitHub에 공개되어 있으니 참고하시거나 피드백 주시면 감사하겠다.

**링크:**
- GitHub: [github.com/0010capacity/0010capacity.github.io](https://github.com/0010capacity/0010capacity.github.io)
- 웹사이트: [0010capacity.github.io](https://0010capacity.github.io)
- API: [0010capacity-backend.fly.dev](https://0010capacity-backend.fly.dev)

---

## 추천 태그

**기술 스택:**
- `#Rust`
- `#NextJS`
- `#TypeScript`
- `#PostgreSQL`
- `#Axum`

**주제:**
- `#풀스택개발`
- `#웹개발`
- `#개인프로젝트`
- `#포트폴리오`
- `#Monorepo`

**플랫폼:**
- `#GitHubPages`
- `#Flyio`
- `#CI/CD`
- `#Docker`

**기능:**
- `#소설플랫폼`
- `#블로그`
- `#콘텐츠관리`
- `#JWT인증`
- `#RESTfulAPI`

**학습:**
- `#개발회고`
- `#프로젝트회고`
- `#기술스택선택`
- `#아키텍처설계`
- `#성능최적화`
