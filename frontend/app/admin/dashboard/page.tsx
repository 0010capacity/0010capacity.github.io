"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Anchor,
} from "@mantine/core";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      router.push("/admin/login/");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login/");
  };

  if (!user) {
    return (
      <Container
        size="md"
        h="100vh"
        display="flex"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <Text c="dimmed" size="sm">
          로딩 중...
        </Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="md">
          <Anchor href="/" c="dimmed" size="sm" underline="hover">
            ← 메인으로
          </Anchor>
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Title order={1} fw={300} size="h2">
                관리자
              </Title>
              <Text c="dimmed" size="sm">
                {user.username}
              </Text>
            </Stack>
            <Button variant="subtle" onClick={handleLogout} size="sm">
              로그아웃
            </Button>
          </Group>
        </Stack>

        {/* Menu */}
        <Stack gap="sm">
          <Anchor
            href="/admin/novels"
            component="a"
            display="block"
            py="md"
            px={0}
            c="inherit"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-8)",
              transition: "border-color 0.2s ease",
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-8)";
            }}
          >
            <Group justify="space-between">
              <Text fw={500}>소설 관리</Text>
              <Text c="dimmed" size="sm">
                →
              </Text>
            </Group>
          </Anchor>

          <Anchor
            href="/admin/blog"
            component="a"
            display="block"
            py="md"
            px={0}
            c="inherit"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-8)",
              transition: "border-color 0.2s ease",
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-8)";
            }}
          >
            <Group justify="space-between">
              <Text fw={500}>블로그 관리</Text>
              <Text c="dimmed" size="sm">
                →
              </Text>
            </Group>
          </Anchor>

          <Anchor
            href="/admin/apps"
            component="a"
            display="block"
            py="md"
            px={0}
            c="inherit"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-8)",
              transition: "border-color 0.2s ease",
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--mantine-color-gray-8)";
            }}
          >
            <Group justify="space-between">
              <Text fw={500}>앱 관리</Text>
              <Text c="dimmed" size="sm">
                →
              </Text>
            </Group>
          </Anchor>
        </Stack>
      </Stack>
    </Container>
  );
}
