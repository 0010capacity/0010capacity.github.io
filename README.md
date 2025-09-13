# 내 개인 홈페이지

이곳은 [Next.js](https://nextjs.org)를 사용하여 구축된 제 개인 웹사이트로, 포트폴리오를 소개하고 앱들의 개인정보 처리방침을 제공합니다. GitHub Pages에 배포됩니다.

## 시작하기

개발 서버를 실행합니다:

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

`app/page.tsx` 파일을 수정하여 페이지를 업데이트할 수 있습니다. 파일을 편집하면 페이지가 자동으로 업데이트됩니다.

## GitHub Pages에 배포

GitHub Pages에 배포하려면:

1. 프로젝트를 빌드합니다:
   ```bash
   npm run export
   ```

2. 정적 파일은 `out` 디렉토리에 생성됩니다.

3. `out` 디렉토리를 `gh-pages` 브랜치에 푸시하거나 GitHub Pages가 `out` 폴더를 제공하도록 설정하세요.

## 더 알아보기

Next.js에 대해 더 알아보려면 다음 리소스를 확인하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능과 API에 대해 알아보세요.
- [Next.js 학습](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼입니다.
