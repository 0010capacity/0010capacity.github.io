"use client";

import Link from "next/link";
import {
  Container,
  Flex,
  UnstyledButton,
  Text,
  Group,
  Box,
} from "@mantine/core";

export default function HomePage() {
  return (
    <Container
      fluid
      h="100dvh"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Content */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: "md", md: "xl" }}
          align="center"
          justify="center"
        >
          {[
            { href: "/novels", label: "소설", sub: "읽으러 가기" },
            { href: "/blog", label: "블로그", sub: "보러 가기" },
            { href: "/apps", label: "앱", sub: "구경하기" },
          ].map(item => (
            <UnstyledButton
              key={item.href}
              component={Link}
              href={item.href}
              p="xl"
              style={theme => ({
                borderRadius: theme.radius.lg,
                border: `1px solid var(--mantine-color-dark-4)`,
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 140,
                height: 140,
                "&:hover": {
                  borderColor: "var(--mantine-color-dark-2)",
                  backgroundColor: "var(--mantine-color-dark-6)",
                },
              })}
            >
              <Text
                size="lg"
                fw={500}
                c="dimmed"
                style={{ transition: "color 0.2s" }}
                className="group-hover:text-white"
              >
                {item.label}
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                {item.sub}
              </Text>
            </UnstyledButton>
          ))}
        </Flex>
      </Box>

      {/* Footer */}
      <Box py="md">
        <Group justify="center" gap="xs">
          <Text
            component={Link}
            href="/about"
            size="sm"
            c="dimmed"
            style={{ textDecoration: "none" }}
          >
            이정원에 대해
          </Text>
          <Text c="dark.6">·</Text>
          <Text
            component={Link}
            href="/admin/login"
            size="sm"
            c="dark.6"
            style={{ textDecoration: "none" }}
          >
            관리
          </Text>
        </Group>
      </Box>
    </Container>
  );
}
