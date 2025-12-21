"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import {
  AppShell,
  Container,
  Group,
  Title,
  Text,
  Button,
  Loader,
} from "@mantine/core";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
}

export default function AdminLayout({
  children,
  title,
  backHref = "/admin/dashboard",
  backLabel = "← 대시보드",
  onBack,
}: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      router.push("/admin/login/");
      return;
    }

    setUser(JSON.parse(storedUser));
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login/");
  };

  if (isLoading) {
    return (
      <Container
        h="100vh"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader color="gray" size="sm" />
        <Text size="sm" c="dimmed" ml="sm">
          로딩 중...
        </Text>
      </Container>
    );
  }

  return (
    <AppShell
      header={{ height: 0 }} // No fixed header, but using AppShell for structure
      padding="md"
    >
      <Container size="sm" py="xl">
        {/* Header */}
        <header style={{ marginBottom: "var(--mantine-spacing-xl)" }}>
          <Group justify="space-between" mb="lg">
            {onBack ? (
              <Button variant="subtle" color="gray" size="sm" onClick={onBack}>
                {backLabel}
              </Button>
            ) : (
              <Button
                component={Link}
                href={backHref}
                variant="subtle"
                color="gray"
                size="sm"
              >
                {backLabel}
              </Button>
            )}
            <Group gap="md">
              <Text size="sm" c="dimmed">
                {user?.username}
              </Text>
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </Group>
          </Group>
          <Title order={1} fw={300} size="h2">
            {title}
          </Title>
        </header>

        {/* Content */}
        <main>{children}</main>
      </Container>
    </AppShell>
  );
}
