"use client";

import Link from "next/link";
import { Container, Stack, Title, Text, Group } from "@mantine/core";

/**
 * GitHub Pages + Next.js static export note:
 * - GitHub Pages serves only exported static files.
 * - App-level SPA-style redirect from not-found can easily create redirect loops
 *   (e.g. /some/path -> 404 -> redirect to / -> restore -> 404 -> ...).
 *
 * So we intentionally DO NOT redirect here. We just render a 404 UI with a link home.
 */
export default function NotFound() {
  return (
    <Container
      size="sm"
      h="100vh"
      display="flex"
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack gap="lg" align="center" ta="center">
        <Title order={1} fw={300} size="h2">
          404
        </Title>
        <Text c="dimmed" size="sm">
          페이지를 찾을 수 없습니다
        </Text>

        <Group justify="center" gap="md">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Text size="sm" c="dimmed">
              ← 홈으로 돌아가기
            </Text>
          </Link>

          <Link
            href="/"
            style={{ textDecoration: "none" }}
            onClick={() => {
              try {
                // If the SPA fallback stored something stale, clear it.
                sessionStorage.removeItem("spa-redirect");
                sessionStorage.removeItem("spa-redirect-attempted");
              } catch {
                // ignore
              }
            }}
          >
            <Text size="sm" c="dimmed">
              (리다이렉트 정보 초기화)
            </Text>
          </Link>
        </Group>
      </Stack>
    </Container>
  );
}
