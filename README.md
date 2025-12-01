# 0010capacity

0010capacity의 개인 브랜드 플랫폼 - 소설, 블로그, 앱 마켓플레이스를 제공하는 종합 서비스입니다.

## 🏗️ 프로젝트 구조

이 저장소는 Monorepo로 구성되어 있습니다:

```
0010capacity.github.io/
├── frontend/          # Next.js 프론트엔드 (GitHub Pages)
│   ├── app/          # Next.js 15 App Router
│   ├── components/   # React 컴포넌트
│   ├── hooks/        # Custom React Hooks
│   ├── lib/          # 유틸리티 함수
│   └── public/       # 정적 파일
├── backend/           # Rust API 서버 (Fly.io)
│   ├── src/          # Rust 소스 코드
│   ├── migrations/   # 데이터베이스 마이그레이션
│   └── Cargo.toml    # Rust 의존성
└── .github/
    └── workflows/     # CI/CD 파이프라인
```

## 🚀 시작하기

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### Backend (Rust)

```bash
cd backend
cargo run
```

API 서버가 [http://localhost:8080](http://localhost:8080)에서 실행됩니다.

## 📦 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Deployment**: GitHub Pages

### Backend
- **Language**: Rust
- **Framework**: Axum
- **Database**: PostgreSQL (Fly.io Postgres)
- **ORM**: SQLx
- **Deployment**: Fly.io

## 🌐 배포

### 자동 배포 (GitHub Actions)

- **Frontend**: `main` 브랜치에 `frontend/` 경로 변경 시 자동으로 GitHub Pages에 배포
- **Backend**: `main` 브랜치에 `backend/` 경로 변경 시 자동으로 Fly.io에 배포

### 수동 배포

#### Frontend
```bash
cd frontend
npm run export
# out/ 디렉토리가 생성되고 GitHub Pages로 배포됩니다
```

#### Backend
```bash
cd backend
flyctl deploy
```

## 🔗 링크

- **Website**: [https://0010capacity.github.io](https://0010capacity.github.io)
- **API**: [https://0010capacity-backend.fly.dev](https://0010capacity-backend.fly.dev)
- **GitHub**: [https://github.com/0010capacity](https://github.com/0010capacity)

## 📝 라이센스

이 프로젝트는 개인 포트폴리오 프로젝트입니다.

## 📧 연락처

문의사항이 있으시면 GitHub Issues를 통해 연락 주세요.