# 🚀 0010capacity 로컬 개발 환경 설정 가이드

## Phase 1: 백엔드 기본 설정

### 필수 요구사항
- Rust 1.75+
- PostgreSQL 14+
- Docker (선택사항, Fly.io 배포용)

---

## 1️⃣ PostgreSQL 설치 및 실행

### macOS (Homebrew)
```bash
# PostgreSQL 설치
brew install postgresql@15

# 서비스 시작
brew services start postgresql@15

# psql 접속 확인
psql postgres
```

### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 설치
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
- [PostgreSQL Windows Installer](https://www.postgresql.org/download/windows/) 다운로드 및 실행

---

## 2️⃣ 데이터베이스 생성

```bash
# psql에 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE capacity;

# 사용자 생성 (선택사항)
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres WITH CREATEDB;

# 접속 확인
\c capacity
```

또는 한 줄로:
```bash
createdb capacity
```

---

## 3️⃣ 백엔드 환경 설정

### .env 파일 생성
```bash
cd backend
cp .env.example .env
```

`.env` 내용 확인:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/capacity
PORT=8080
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=604800
RUST_LOG=backend=debug,tower_http=debug,axum=debug
```

---

## 4️⃣ 데이터베이스 마이그레이션

### 마이그레이션 실행
```bash
cd backend

# SQLx CLI 설치 (처음 한 번만)
cargo install sqlx-cli --no-default-features --features postgres

# 마이그레이션 실행
sqlx migrate run
```

### 마이그레이션 확인
```bash
psql capacity -c "\dt"
```

출력 예:
```
               List of relations
 Schema |        Name        | Type  | Owner
--------+--------------------+-------+-------
 public | admins             | table | postgres
 public | apps               | table | postgres
 public | blog_posts         | table | postgres
 public | novel_chapters     | table | postgres
 public | novels             | table | postgres
 public | _sqlx_migrations   | table | postgres
(6 rows)
```

---

## 5️⃣ 백엔드 실행

### 개발 모드
```bash
cd backend
cargo run
```

출력 예:
```
   Compiling backend v0.1.0
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.34s
     Running `target/debug/backend`
2024-12-05T10:30:00.123Z INFO  backend: Server listening on 0.0.0.0:8080
```

### API 테스트
```bash
# 헬스 체크
curl http://localhost:8080/health

# API 정보
curl http://localhost:8080/

# 소설 목록 (빈 결과)
curl http://localhost:8080/api/novels
```

---

## 6️⃣ Frontend 설정 (선택사항)

### Node.js 버전 확인
```bash
node --version  # v18 이상 권장
npm --version   # v9 이상 권장
```

### 의존성 설치 및 실행
```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 🧪 로컬 테스트

### 1. 관리자 계정 생성
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

응답 예:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "admin"
}
```

### 2. 로그인
```bash
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo $TOKEN
```

### 3. 소설 생성
```bash
curl -X POST http://localhost:8080/api/novels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "slug": "my-first-novel",
    "title": "내 첫 번째 소설",
    "description": "테스트 소설입니다",
    "genre": "판타지"
  }'
```

### 4. 소설 조회
```bash
curl http://localhost:8080/api/novels
curl http://localhost:8080/api/novels/my-first-novel
```

---

## 🔧 개발 팁

### 로그 레벨 조정
```bash
RUST_LOG=debug cargo run
RUST_LOG=backend=trace cargo run
```

### SQLx 오프라인 모드
QueryBuilder를 사용하는 경우 런타임 마이그레이션 필요:
```bash
sqlx database prepare -- cargo build
```

### 데이터베이스 초기화
```bash
# 모든 테이블 삭제
sqlx migrate revert --all

# 다시 마이그레이션 실행
sqlx migrate run
```

### 데이터베이스 상태 확인
```bash
# 모든 테이블 확인
psql capacity -c "\dt"

# 특정 테이블 스키마
psql capacity -c "\d novels"

# 데이터 확인
psql capacity -c "SELECT COUNT(*) FROM novels;"
```

---

## 🐛 문제 해결

### PostgreSQL 연결 실패
```bash
# PostgreSQL 상태 확인
brew services list

# PostgreSQL 다시 시작
brew services restart postgresql@15
```

### 포트 8080 이미 사용 중
```bash
# 포트 사용 현황 확인
lsof -i :8080

# 다른 포트 사용
PORT=8081 cargo run
```

### 마이그레이션 충돌
```bash
# 마이그레이션 초기화
sqlx migrate revert --all
sqlx migrate run
```

### Cargo 빌드 실패
```bash
# 캐시 제거 후 다시 빌드
cargo clean
cargo build
```

---

## 📋 다음 단계

✅ **Phase 1 완료 후:**
- [ ] PostgreSQL 로컬 설치 완료
- [ ] 마이그레이션 실행 완료
- [ ] `cargo run` 성공
- [ ] API 테스트 완료

➡️ **Phase 2로 진행**: 인증 시스템 고도화 및 이미지 업로드 기능

---

## 📚 참고 자료

- [Rust Book](https://doc.rust-lang.org/book/)
- [Axum Documentation](https://docs.rs/axum/)
- [SQLx Documentation](https://github.com/launchbadge/sqlx)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)