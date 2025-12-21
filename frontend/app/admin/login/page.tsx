"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TextInput,
  Button,
  Stack,
  Text,
  Alert,
  Center,
  Loader,
  Box,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { authApi } from "@/lib/api";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const storedUser = localStorage.getItem("admin_user");

    if (storedToken && storedUser) {
      router.push("/admin/dashboard/");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <Center mih="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = (await authApi.login({
        username,
        password,
      })) as LoginResponse;

      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_user", JSON.stringify(response.user));

      router.push("/admin/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" px="md">
      <Box w="100%" maw={400}>
        {/* Header */}
        <Stack gap="xl" align="center" mb="xl">
          <Text size="xl" fw={300}>
            관리자 로그인
          </Text>
        </Stack>

        {/* Form */}
        <Stack component="form" onSubmit={handleSubmit} gap="lg">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title="오류"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Stack gap="sm">
            <TextInput
              label="사용자명"
              id="username"
              value={username}
              onChange={e => setUsername(e.currentTarget.value)}
              required
              disabled={loading}
            />
          </Stack>

          <Stack gap="sm">
            <TextInput
              label="비밀번호"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              required
              disabled={loading}
            />
          </Stack>

          <Button type="submit" disabled={loading} fullWidth variant="filled">
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </Stack>

        {/* Footer */}
        <Center mt="xl">
          <Link href="/">
            <Text
              size="sm"
              c="dimmed"
              component="a"
              style={{ textDecoration: "none" }}
            >
              ← 돌아가기
            </Text>
          </Link>
        </Center>
      </Box>
    </Center>
  );
}
